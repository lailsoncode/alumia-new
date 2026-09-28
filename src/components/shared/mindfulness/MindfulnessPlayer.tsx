import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Cancel01Icon,
  CloudRainIcon,
  EarIcon,
  PauseIcon,
  PlayIcon,
  SlowWindsIcon,
  StopIcon,
  VolumeHighIcon,
  VolumeOffIcon,
  WaveIcon,
  Yoga01Icon,
} from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { InlineFeedback } from "@/components/ui/surface";
import { formatMindfulnessTime } from "@/lib/mindfulness";
import { startMindfulnessAmbientSound, type MindfulnessAmbientHandle, type MindfulnessAmbientSound } from "@/lib/mindfulnessAmbient";
import { synthesizeAlumiaSpeech } from "@/services/alumiaAIService";
import type { MindfulnessFormat, MindfulnessPractice } from "@/types";

interface MindfulnessPlayerProps {
  practice: MindfulnessPractice;
  initialFormat: MindfulnessFormat;
  onAlternative: () => void;
  onFinish: (result: { elapsedSeconds: number; startedAt: string; endedEarly: boolean; format: MindfulnessFormat }) => void;
}

export function MindfulnessPlayer({ practice, initialFormat, onAlternative, onFinish }: MindfulnessPlayerProps) {
  const plannedSeconds = practice.durationMinutes * 60;
  const [remainingSeconds, setRemainingSeconds] = useState(plannedSeconds);
  const [running, setRunning] = useState(true);
  const [format, setFormat] = useState<MindfulnessFormat>(() => (
    practice.formats.includes(initialFormat) ? initialFormat : practice.formats[0] ?? "text"
  ));
  const [audioError, setAudioError] = useState<string | null>(null);
  const [narrationState, setNarrationState] = useState<"idle" | "loading" | "playing">("idle");
  const [narrationEnabled, setNarrationEnabled] = useState(format === "audio");
  const [ambientSound, setAmbientSound] = useState<MindfulnessAmbientSound>("none");
  const [ambientVolume, setAmbientVolume] = useState(0.35);
  const deadlineRef = useRef(Date.now() + plannedSeconds * 1000);
  const startedAtRef = useRef(new Date().toISOString());
  const finishedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const narrationRequestRef = useRef(0);
  const ambientRef = useRef<MindfulnessAmbientHandle | null>(null);

  const elapsedSeconds = plannedSeconds - remainingSeconds;
  const stepIndex = Math.min(
    practice.instructions.length - 1,
    Math.floor((elapsedSeconds / Math.max(1, plannedSeconds)) * practice.instructions.length),
  );
  const currentInstruction = practice.instructions[Math.max(0, stepIndex)];

  const stopNarration = useCallback(() => {
    narrationRequestRef.current += 1;
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const stopAmbient = useCallback(() => {
    ambientRef.current?.stop();
    ambientRef.current = null;
  }, []);

  const finish = (endedEarly = remainingSeconds > 0) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    stopNarration();
    stopAmbient();
    onFinish({ elapsedSeconds: Math.max(0, elapsedSeconds), startedAt: startedAtRef.current, endedEarly, format });
  };

  useEffect(() => {
    if (!running) return;
    const update = () => {
      const next = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setRemainingSeconds(next);
      if (next === 0 && !finishedRef.current) {
        finishedRef.current = true;
        stopNarration();
        stopAmbient();
        onFinish({ elapsedSeconds: plannedSeconds, startedAt: startedAtRef.current, endedEarly: false, format });
      }
    };
    const interval = window.setInterval(update, 250);
    update();
    return () => window.clearInterval(interval);
  }, [format, onFinish, plannedSeconds, running, stopAmbient, stopNarration]);

  useEffect(() => () => stopNarration(), [stopNarration]);
  useEffect(() => () => stopAmbient(), [stopAmbient]);

  const speakCurrentInstruction = useCallback(async () => {
    if (!currentInstruction) {
      setAudioError("Esta orientação não possui texto para narração.");
      setNarrationEnabled(false);
      if (practice.formats.includes("text")) setFormat("text");
      return;
    }
    stopNarration();
    const requestId = ++narrationRequestRef.current;
    setAudioError(null);
    setNarrationState("loading");
    try {
      const blob = await synthesizeAlumiaSpeech(currentInstruction);
      if (narrationRequestRef.current !== requestId) return;

      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audioUrlRef.current = audioUrl;
      audio.onended = () => {
        if (narrationRequestRef.current !== requestId) return;
        audioRef.current = null;
        audioUrlRef.current = null;
        URL.revokeObjectURL(audioUrl);
        setNarrationState("idle");
      };
      audio.onerror = () => {
        if (narrationRequestRef.current !== requestId) return;
        stopNarration();
        setNarrationState("idle");
        setAudioError("Não foi possível reproduzir a voz da Alumia agora. A orientação em texto continua disponível.");
        setNarrationEnabled(false);
        if (practice.formats.includes("text")) setFormat("text");
      };
      await audio.play();
      if (narrationRequestRef.current === requestId) setNarrationState("playing");
    } catch {
      if (narrationRequestRef.current !== requestId) return;
      stopNarration();
      setNarrationState("idle");
      setAudioError("Não foi possível gerar a voz da Alumia agora. A orientação em texto continua disponível.");
      setNarrationEnabled(false);
      if (practice.formats.includes("text")) setFormat("text");
    }
  }, [currentInstruction, practice.formats, stopNarration]);

  useEffect(() => {
    if (narrationEnabled && running) void speakCurrentInstruction();
  }, [narrationEnabled, running, speakCurrentInstruction]);

  useEffect(() => {
    ambientRef.current?.setVolume(ambientVolume);
  }, [ambientVolume]);

  const toggleRunning = () => {
    if (running) {
      setRunning(false);
      stopNarration();
      setNarrationState("idle");
      ambientRef.current?.pause();
    } else {
      deadlineRef.current = Date.now() + remainingSeconds * 1000;
      ambientRef.current?.resume();
      setRunning(true);
    }
  };

  const toggleNarration = () => {
    if (narrationEnabled) {
      stopNarration();
      setNarrationState("idle");
      setNarrationEnabled(false);
      if (practice.formats.includes("text")) setFormat("text");
      return;
    }
    if (!practice.formats.includes("audio")) return;
    setAudioError(null);
    setFormat("audio");
    setNarrationEnabled(true);
  };

  const chooseAmbientSound = (next: MindfulnessAmbientSound) => {
    stopAmbient();
    setAmbientSound(next);
    setAudioError(null);
    if (next === "none") return;
    const ambient = startMindfulnessAmbientSound(next, ambientVolume);
    if (!ambient) {
      setAmbientSound("none");
      setAudioError("Os sons ambientes não estão disponíveis neste dispositivo.");
      return;
    }
    ambientRef.current = ambient;
    if (!running) ambient.pause();
  };

  const progress = plannedSeconds ? elapsedSeconds / plannedSeconds : 0;
  const blobStyle = useMemo(() => ({ transform: `scale(${0.94 + progress * 0.08})` }), [progress]);

  return (
    <section role="dialog" aria-modal="true" aria-labelledby="mindfulness-player-title" className="module-theme-mindfulness fixed inset-0 z-[60] overflow-y-auto bg-background px-4 py-[max(1rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex min-h-full max-w-2xl flex-col">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" size="icon" onClick={() => finish()} aria-label="Encerrar prática"><AlumiaIcon icon={Cancel01Icon} size="md" /></Button>
          <p className="font-display text-lg font-medium text-muted-foreground">Prática guiada</p>
          <Button variant="ghost" size="icon" disabled={!practice.formats.includes("audio")} onClick={toggleNarration} aria-label={narrationEnabled ? "Desligar narração da Alumia" : "Ligar narração da Alumia"}><AlumiaIcon icon={narrationEnabled ? VolumeHighIcon : VolumeOffIcon} size="md" /></Button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-7 text-center">
          <h2 id="mindfulness-player-title" className="font-display text-2xl font-semibold sm:text-3xl">{practice.title}</h2>
          <div className="relative mt-7 flex h-60 w-60 items-center justify-center sm:h-72 sm:w-72">
            <div aria-hidden="true" style={blobStyle} className="absolute inset-2 rounded-[42%_58%_55%_45%/46%_44%_56%_54%] bg-primary/12 transition-transform duration-[4000ms] motion-reduce:transition-none" />
            <div className="relative max-w-[12rem]">
              <AlumiaIcon icon={Yoga01Icon} size="xl" className="mx-auto text-primary" />
              <p className="mt-3 font-display text-2xl font-semibold">{practice.category === "breathing" ? "Respire no seu ritmo" : "Este momento pode ser simples"}</p>
            </div>
          </div>

          <div className="mt-5 max-w-xl">
            <p className="text-sm font-semibold text-primary">{narrationEnabled ? narrationState === "loading" ? "Preparando a voz da Alumia…" : "Narração com a voz da Alumia" : "Orientação atual"}</p>
            <p aria-live="polite" className="mt-1 text-base leading-relaxed text-foreground/80 sm:text-lg">{currentInstruction}</p>
          </div>
          <p className="mt-4 flex items-center gap-2 font-medium text-muted-foreground"><span className="font-display text-xl tabular-nums text-primary">{formatMindfulnessTime(remainingSeconds)}</span> restantes</p>

          {audioError && <div className="mt-4 w-full"><InlineFeedback>{audioError}</InlineFeedback></div>}

          <div className="mt-7 grid w-full max-w-xl grid-cols-2 gap-2">
            <Button size="lg" onClick={toggleRunning}><AlumiaIcon icon={running ? PauseIcon : PlayIcon} size="sm" />{running ? "Pausar" : "Continuar"}</Button>
            <Button size="lg" variant="outline" onClick={() => finish()}><AlumiaIcon icon={StopIcon} size="sm" />Encerrar por agora</Button>
          </div>

          {practice.category === "breathing" && (
            <div className="module-whisper mt-5 w-full max-w-xl rounded-2xl border p-3 text-left">
              <p className="flex items-center gap-2 font-semibold"><AlumiaIcon icon={EarIcon} size="sm" className="module-text" />Respirar não está confortável?</p>
              <Button variant="outline" className="mt-2 w-full" onClick={onAlternative}>Perceber os sons ao redor</Button>
            </div>
          )}

          <p className="mt-5 text-sm text-muted-foreground">Você está no controle desta pausa.</p>
          <div className="mt-5 w-full max-w-xl rounded-2xl border border-border bg-surface p-4 text-left">
            <h3 className="font-display text-lg font-semibold">Som da prática</h3>
            <p className="mt-1 text-sm text-muted-foreground">Combine um ambiente calmo com a narração, ou use apenas um deles.</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {([
                { value: "none", label: "Sem ambiente", icon: VolumeOffIcon },
                { value: "rain", label: "Chuva suave", icon: CloudRainIcon },
                { value: "ocean", label: "Ondas", icon: WaveIcon },
                { value: "breeze", label: "Brisa", icon: SlowWindsIcon },
              ] as const).map((option) => (
                <button key={option.value} type="button" aria-pressed={ambientSound === option.value} onClick={() => chooseAmbientSound(option.value)} className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border px-2 text-center text-xs font-semibold ${ambientSound === option.value ? "border-primary bg-primary/10 text-primary" : "border-input text-muted-foreground"}`}>
                  <AlumiaIcon icon={option.icon} size="sm" />{option.label}
                </button>
              ))}
            </div>
            {ambientSound !== "none" && (
              <label className="mt-4 block text-sm font-medium">
                Volume do ambiente
                <input type="range" min="0" max="1" step="0.05" value={ambientVolume} onChange={(event) => setAmbientVolume(Number(event.target.value))} className="mt-2 w-full accent-primary" />
              </label>
            )}
            <button type="button" disabled={!practice.formats.includes("audio")} aria-label={`Narração da Alumia: ${narrationEnabled ? "ligada" : "desligada"}`} aria-pressed={narrationEnabled} onClick={toggleNarration} className={`mt-3 flex min-h-12 w-full items-center justify-between rounded-xl border px-3 text-sm font-semibold ${narrationEnabled ? "border-primary bg-primary/10 text-primary" : "border-input text-muted-foreground"} disabled:opacity-40`}>
              <span className="flex items-center gap-2"><AlumiaIcon icon={narrationEnabled ? VolumeHighIcon : VolumeOffIcon} size="sm" />Narração da Alumia</span>
              <span>{narrationEnabled ? "Ligada" : "Desligada"}</span>
            </button>
          </div>

          <div className="mt-5 w-full max-w-xl rounded-2xl border border-border bg-surface p-4 text-left">
            <h3 className="font-display text-lg font-semibold">Roteiro da prática</h3>
            <p className="mt-1 text-sm text-muted-foreground">A transcrição fica disponível durante toda a pausa.</p>
            <ol className="mt-3 space-y-2">
              {practice.instructions.map((instruction, index) => (
                <li
                  key={`${practice.id}-${index}`}
                  aria-current={index === stepIndex ? "step" : undefined}
                  className={`flex gap-3 rounded-xl p-3 text-sm leading-relaxed ${index === stepIndex ? "bg-primary/10 text-foreground" : "text-muted-foreground"}`}
                >
                  <span aria-hidden="true" className="font-semibold text-primary">{index + 1}</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
