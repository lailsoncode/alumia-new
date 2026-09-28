import { useCallback, useEffect, useRef, useState } from "react";
import { Cancel01Icon, Mic01Icon, SparklesIcon, StopIcon, VolumeHighIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { RiveAlumia } from "@/components/shared/alumia-presence/RiveAlumia";
import { cn } from "@/lib/utils";
import {
  connectAlumiaLive,
  type AlumiaLiveServerEvent,
  type AlumiaLiveStatus,
} from "@/services/alumiaLiveService";

const MAX_SESSION_SECONDS = 5 * 60;

type Transcript = { role: "user" | "assistant"; text: string };

type AlumiaLiveVoiceProps = {
  open: boolean;
  onClose: () => void;
};

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

function base64ToPcm(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Int16Array(bytes.buffer);
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

function mergeTranscript(previous: string, next: string) {
  if (next.startsWith(previous)) return next;
  if (previous.endsWith(next)) return previous;
  const separator = /\s$/.test(previous) || /^\s|^[,.;:!?]/.test(next) ? "" : " ";
  return `${previous}${separator}${next}`;
}

export function AlumiaLiveVoice({ open, onClose }: AlumiaLiveVoiceProps) {
  const [status, setStatus] = useState<AlumiaLiveStatus | "idle" | "ending">("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [transcript, setTranscript] = useState<Transcript[]>([]);
  const [error, setError] = useState<string | null>(null);
  const connectionRef = useRef<Awaited<ReturnType<typeof connectAlumiaLive>> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputNodeRef = useRef<AudioWorkletNode | null>(null);
  const playbackSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextPlaybackTimeRef = useRef(0);
  const mountedRef = useRef(true);

  const clearPlayback = useCallback(() => {
    for (const source of playbackSourcesRef.current) {
      try { source.stop(); } catch { /* Source may already be stopped. */ }
    }
    playbackSourcesRef.current.clear();
    nextPlaybackTimeRef.current = audioContextRef.current?.currentTime ?? 0;
  }, []);

  const cleanup = useCallback((notifyServer = true) => {
    if (notifyServer) connectionRef.current?.stop();
    connectionRef.current = null;
    inputNodeRef.current?.disconnect();
    inputNodeRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    clearPlayback();
    const context = audioContextRef.current;
    audioContextRef.current = null;
    if (context && context.state !== "closed") void context.close();
  }, [clearPlayback]);

  const playAudio = useCallback((base64: string, sampleRate = 24_000) => {
    const context = audioContextRef.current;
    if (!context || context.state === "closed") return;
    const pcm = base64ToPcm(base64);
    const buffer = context.createBuffer(1, pcm.length, sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < pcm.length; index += 1) channel[index] = pcm[index] / 0x8000;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    const startAt = Math.max(context.currentTime + 0.02, nextPlaybackTimeRef.current);
    source.start(startAt);
    nextPlaybackTimeRef.current = startAt + buffer.duration;
    playbackSourcesRef.current.add(source);
    source.onended = () => playbackSourcesRef.current.delete(source);
  }, []);

  const updateTranscript = useCallback((event: Extract<AlumiaLiveServerEvent, { type: "transcript" }>) => {
    const text = event.text.trim();
    if (!text) return;
    setTranscript((current) => {
      const last = current.at(-1);
      if (last?.role === event.role) {
        return [...current.slice(0, -1), { role: event.role, text: mergeTranscript(last.text, text) }];
      }
      return [...current.slice(-3), { role: event.role, text }];
    });
  }, []);

  const beginCapture = useCallback(async (context: AudioContext, stream: MediaStream) => {
    await context.audioWorklet.addModule("/audio-processors/alumia-live-capture.js");
    if (!mountedRef.current || !connectionRef.current) return;
    const source = context.createMediaStreamSource(stream);
    const capture = new AudioWorkletNode(context, "alumia-live-capture");
    const silentGain = context.createGain();
    silentGain.gain.value = 0;
    capture.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
      connectionRef.current?.sendAudio(arrayBufferToBase64(event.data));
    };
    source.connect(capture);
    capture.connect(silentGain);
    silentGain.connect(context.destination);
    inputNodeRef.current = capture;
  }, []);

  const start = useCallback(async () => {
    if (status !== "idle") return;
    setError(null);
    setTranscript([]);
    setElapsedSeconds(0);
    setStatus("connecting");
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof AudioContext === "undefined") {
        throw new Error("AUDIO_UNAVAILABLE");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      const context = new AudioContext({ latencyHint: "interactive" });
      audioContextRef.current = context;
      await context.resume();

      connectionRef.current = await connectAlumiaLive({
        onEvent: (event) => {
          if (event.type === "status") {
            setStatus(event.status);
            if (event.status === "listening" && !inputNodeRef.current) {
              void beginCapture(context, stream).catch(() => {
                setError("Não consegui iniciar a captura contínua do microfone neste dispositivo.");
              });
            }
          } else if (event.type === "audio") {
            playAudio(event.data, event.sampleRate);
          } else if (event.type === "interrupted") {
            clearPlayback();
            setStatus("listening");
          } else if (event.type === "transcript") {
            updateTranscript(event);
          } else if (event.type === "limit") {
            setError("A conversa chegou ao limite de 5 minutos deste teste.");
            setStatus("ending");
            cleanup(false);
          } else if (event.type === "error") {
            setError("A conversa ao vivo ficou indisponível. O chat escrito continua funcionando normalmente.");
          }
        },
        onClose: (event) => {
          if (!mountedRef.current) return;
          cleanup(false);
          setStatus("idle");
          if (![1000, 4000].includes(event.code)) {
            setError(event.code === 4429
              ? "Já existe uma conversa ao vivo aberta nesta conta."
              : "A conexão ao vivo foi encerrada. Você pode tentar novamente.");
          }
        },
        onError: () => setError("Não consegui conectar a conversa ao vivo agora."),
      });
    } catch (caught) {
      cleanup(false);
      setStatus("idle");
      const name = caught instanceof DOMException ? caught.name : "";
      setError(name === "NotAllowedError"
        ? "A permissão do microfone está bloqueada. Libere Microfone nas configurações da Alumia."
        : "Não consegui iniciar a conversa ao vivo. Verifique o microfone e tente novamente.");
    }
  }, [beginCapture, cleanup, clearPlayback, playAudio, status, updateTranscript]);

  const stop = useCallback(() => {
    setStatus("ending");
    cleanup();
    setStatus("idle");
  }, [cleanup]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    if (!open || status === "idle") return;
    const interval = window.setInterval(() => {
      setElapsedSeconds((current) => {
        if (current + 1 >= MAX_SESSION_SECONDS) {
          setError("A conversa chegou ao limite de 5 minutos deste teste.");
          stop();
          return MAX_SESSION_SECONDS;
        }
        return current + 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [open, status, stop]);

  useEffect(() => {
    if (!open) stop();
  }, [open, stop]);

  if (!open) return null;

  const statusLabel = status === "connecting" ? "Conectando…"
    : status === "listening" ? "Estou ouvindo"
      : status === "speaking" ? "Alumia está falando"
        : status === "ending" ? "Encerrando…"
          : "Pronta para conversar";

  return (
    <Surface className="relative overflow-hidden p-4 sm:p-6" role="dialog" aria-modal="true" aria-label="Conversa ao vivo com a Alumia">
      <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 z-10" onClick={() => { stop(); onClose(); }} aria-label="Fechar conversa ao vivo">
        <AlumiaIcon icon={Cancel01Icon} size="sm" />
      </Button>

      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <div className={cn(
          "relative mt-2 h-52 w-52 transition-transform duration-500 sm:h-64 sm:w-64",
          status === "speaking" && "scale-[1.035]",
        )}>
          <div className={cn(
            "absolute inset-5 rounded-full bg-primary/10 blur-2xl transition-all duration-700",
            status === "listening" && "animate-pulse bg-tone-aqua/35",
            status === "speaking" && "animate-pulse bg-tone-lavender/40",
          )} />
          <RiveAlumia className="relative h-full w-full" alt="Avatar da Alumia na conversa ao vivo" />
        </div>

        <div className="-mt-3 flex min-h-7 items-center gap-2 text-sm font-semibold module-text" role="status" aria-live="polite">
          <AlumiaIcon icon={status === "speaking" ? VolumeHighIcon : status === "listening" ? Mic01Icon : SparklesIcon} size="sm" />
          {statusLabel}
          {status !== "idle" && <span className="font-normal text-muted-foreground">· {formatTime(elapsedSeconds)} / 5:00</span>}
        </div>

        <div className="mt-4 min-h-24 w-full rounded-2xl bg-surface-subtle/70 p-3 text-left" aria-live="polite">
          {transcript.length ? transcript.slice(-2).map((item, index) => (
            <p key={`${item.role}-${index}`} className={cn("text-sm leading-relaxed", index > 0 && "mt-2", item.role === "assistant" ? "font-medium" : "text-muted-foreground")}>
              <span className="sr-only">{item.role === "assistant" ? "Alumia: " : "Você: "}</span>
              {item.text}
            </p>
          )) : (
            <p className="text-center text-sm text-muted-foreground">
              {status === "idle" ? "Toque em iniciar e converse naturalmente. Você pode interromper a Alumia enquanto ela fala." : "A conversa aparecerá aqui enquanto vocês falam."}
            </p>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {status === "idle" ? (
            <Button type="button" size="lg" onClick={() => void start()}>
              <AlumiaIcon icon={Mic01Icon} size="md" />
              Iniciar conversa ao vivo
            </Button>
          ) : (
            <Button type="button" size="lg" variant="destructive" onClick={stop} disabled={status === "ending"}>
              <AlumiaIcon icon={StopIcon} size="md" />
              Encerrar conversa
            </Button>
          )}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Áudio e transcrição não são salvos. Para criar tarefas ou lembretes, use o chat escrito.</p>
      </div>
    </Surface>
  );
}
