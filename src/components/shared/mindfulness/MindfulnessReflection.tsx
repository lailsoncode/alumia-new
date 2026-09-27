import { BellIcon, Calendar01Icon, CloudIcon, Leaf01Icon, PlayIcon, Yoga01Icon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import type { MindfulnessPractice, MindfulnessReflection as Reflection, MindfulnessReminderChoice } from "@/types";

const reflections: { value: Reflection; label: string; icon: typeof CloudIcon }[] = [
  { value: "same", label: "Do mesmo jeito", icon: CloudIcon },
  { value: "present", label: "Um pouco mais presente", icon: Leaf01Icon },
  { value: "another", label: "Quero outra prática", icon: PlayIcon },
];

interface MindfulnessReflectionProps {
  practice: MindfulnessPractice;
  elapsedSeconds: number;
  reflection?: Reflection;
  reminder?: MindfulnessReminderChoice;
  saving: boolean;
  onReflectionChange: (value?: Reflection) => void;
  onReminderChange: (value?: MindfulnessReminderChoice) => void;
  onSave: () => void;
}

export function MindfulnessReflection({ practice, elapsedSeconds, reflection, reminder, saving, onReflectionChange, onReminderChange, onSave }: MindfulnessReflectionProps) {
  const minutes = Math.round(elapsedSeconds / 60);
  const elapsedLabel = elapsedSeconds < 60
    ? "menos de 1 minuto"
    : `${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
  return (
    <section role="dialog" aria-modal="true" aria-labelledby="mindfulness-reflection-title" className="module-theme-mindfulness fixed inset-0 z-[60] overflow-y-auto bg-background px-4 py-[max(1.25rem,env(safe-area-inset-top))]">
      <div className="mx-auto max-w-2xl space-y-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <header className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12 text-primary"><AlumiaIcon icon={Yoga01Icon} size="lg" /></span>
          <div>
            <h2 id="mindfulness-reflection-title" className="font-display text-2xl font-semibold">Sua pausa aconteceu</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Cuidar de si também pode fazer parte da sua jornada.</p>
          </div>
        </header>

        <div className="module-surface rounded-2xl border p-4">
          <p className="font-display text-xl font-semibold">Você reservou <span className="text-primary">{elapsedLabel}</span></p>
          <p className="mt-1 text-sm text-muted-foreground">{practice.title}</p>
        </div>

        <fieldset>
          <legend className="font-display text-xl font-semibold">Como você está agora?</legend>
          <p className="mt-0.5 text-sm text-muted-foreground">A resposta é opcional e não existe escolha certa.</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {reflections.map((option) => (
              <button key={option.value} type="button" aria-pressed={reflection === option.value} onClick={() => onReflectionChange(reflection === option.value ? undefined : option.value)} className={`flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border px-2 text-center text-sm font-semibold ${reflection === option.value ? "border-primary bg-primary/12 text-primary" : "border-border bg-surface"}`}>
                <AlumiaIcon icon={option.icon} size="md" />{option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <p className="module-whisper rounded-2xl border p-4 text-sm leading-relaxed text-foreground/80">Não precisa se sentir diferente para esta pausa ter valor.</p>

        <fieldset className="border-t border-border pt-5">
          <legend className="font-display text-xl font-semibold">Quer lembrar desta prática?</legend>
          <p className="mt-0.5 text-sm text-muted-foreground">A Alumia pode criar um lembrete no momento escolhido.</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button type="button" aria-pressed={reminder === "later"} onClick={() => onReminderChange(reminder === "later" ? undefined : "later")} className={`min-h-11 rounded-full border px-2 text-xs font-semibold sm:text-sm ${reminder === "later" ? "border-primary bg-primary/12 text-primary" : "border-input bg-surface"}`}><AlumiaIcon icon={BellIcon} size="xs" className="mr-1 inline" />Mais tarde</button>
            <button type="button" aria-pressed={reminder === "tomorrow"} onClick={() => onReminderChange(reminder === "tomorrow" ? undefined : "tomorrow")} className={`min-h-11 rounded-full border px-2 text-xs font-semibold sm:text-sm ${reminder === "tomorrow" ? "border-primary bg-primary/12 text-primary" : "border-input bg-surface"}`}><AlumiaIcon icon={Calendar01Icon} size="xs" className="mr-1 inline" />Amanhã</button>
            <button type="button" aria-pressed={!reminder} onClick={() => onReminderChange(undefined)} className={`min-h-11 rounded-full border px-2 text-xs font-semibold sm:text-sm ${!reminder ? "border-primary bg-primary/12 text-primary" : "border-input bg-surface"}`}>Não agora</button>
          </div>
        </fieldset>

        <Button size="lg" className="w-full" disabled={saving} onClick={onSave}>{saving ? "Salvando…" : reflection === "another" ? "Salvar e escolher outra" : "Voltar ao Mindfulness"}</Button>
      </div>
    </section>
  );
}
