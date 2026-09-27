import { useEffect, useRef, useState } from "react";
import { BookOpen01Icon, Cancel01Icon, Coffee01Icon, PauseIcon, PlayIcon, StopIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { formatFocusTime } from "@/lib/student";
import type { StudentCommitment } from "@/types";

interface FocusSessionProps {
  commitment?: StudentCommitment;
  minutes: number;
  onFinish: (result: { elapsedSeconds: number; startedAt: string }) => void;
}

export function FocusSession({ commitment, minutes, onFinish }: FocusSessionProps) {
  const plannedSeconds = minutes * 60;
  const [remainingSeconds, setRemainingSeconds] = useState(plannedSeconds);
  const [running, setRunning] = useState(true);
  const deadlineRef = useRef(Date.now() + plannedSeconds * 1000);
  const startedAtRef = useRef(new Date().toISOString());
  const finishedRef = useRef(false);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish({
      elapsedSeconds: Math.max(0, plannedSeconds - remainingSeconds),
      startedAt: startedAtRef.current,
    });
  };

  useEffect(() => {
    if (!running) return;
    const update = () => {
      const next = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setRemainingSeconds(next);
      if (next === 0 && !finishedRef.current) {
        finishedRef.current = true;
        onFinish({ elapsedSeconds: plannedSeconds, startedAt: startedAtRef.current });
      }
    };
    const interval = window.setInterval(update, 250);
    update();
    return () => window.clearInterval(interval);
  }, [onFinish, plannedSeconds, running]);

  const toggleRunning = () => {
    if (running) setRunning(false);
    else {
      deadlineRef.current = Date.now() + remainingSeconds * 1000;
      setRunning(true);
    }
  };

  const progress = plannedSeconds ? (plannedSeconds - remainingSeconds) / plannedSeconds : 0;
  const circumference = 2 * Math.PI * 45;

  return (
    <section role="dialog" aria-modal="true" aria-labelledby="focus-session-title" className="module-theme-student fixed inset-0 z-[60] overflow-y-auto bg-background px-4 py-[max(1rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex min-h-full max-w-2xl flex-col">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={finish} aria-label="Encerrar sessão"><AlumiaIcon icon={Cancel01Icon} size="md" /></Button>
          <h2 id="focus-session-title" className="font-display text-xl font-medium sm:text-2xl">Sessão de foco</h2>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><AlumiaIcon icon={BookOpen01Icon} size="sm" /></span>
            <span className="font-medium">{commitment?.studentDetails.subject?.name || "Sessão livre"}</span>
          </div>
          <h3 className="mt-3 max-w-xl font-display text-2xl font-semibold sm:text-3xl">{commitment?.title || "Tempo para estudar"}</h3>

          <div className="relative mt-8 flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80" role="timer" aria-label={`${formatFocusTime(remainingSeconds)} restantes`}>
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--module-soft)" strokeWidth="4" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--module-accent)" strokeWidth="4" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} />
            </svg>
            <span className="font-display text-5xl font-semibold tabular-nums sm:text-6xl">{formatFocusTime(remainingSeconds)}</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Você escolheu <strong className="text-foreground">{minutes} minutos</strong></p>

          <div className="mt-8 w-full max-w-xl space-y-2">
            <Button size="lg" className="w-full" onClick={toggleRunning}>
              <AlumiaIcon icon={running ? PauseIcon : PlayIcon} size="sm" />{running ? "Pausar" : "Continuar"}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setRunning(false)}><AlumiaIcon icon={Coffee01Icon} size="sm" />Preciso de uma pausa</Button>
              <Button variant="outline" onClick={finish}><AlumiaIcon icon={StopIcon} size="sm" />Encerrar por agora</Button>
            </div>
          </div>

          <p className="module-whisper mt-8 max-w-xl rounded-2xl border px-4 py-3 text-sm leading-relaxed text-foreground/80">
            Avançar um pouco já conta. Você pode ajustar o tempo quando precisar.
          </p>
        </div>
      </div>
    </section>
  );
}
