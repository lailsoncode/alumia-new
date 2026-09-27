import { BookOpenCheckIcon, CalendarAdd01Icon, CloudIcon, Leaf01Icon, PlayIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import type { StudentCommitment, StudyOutcome } from "@/types";

const outcomes: { value: StudyOutcome; label: string; icon: typeof CloudIcon }[] = [
  { value: "difficult", label: "Foi difícil", icon: CloudIcon },
  { value: "progress", label: "Consegui avançar", icon: Leaf01Icon },
  { value: "continue", label: "Quero continuar", icon: PlayIcon },
];

const reviewOptions = [
  { days: 1, label: "Amanhã" },
  { days: 3, label: "Em 3 dias" },
  { days: 7, label: "Na próxima semana" },
];

interface StudyReflectionProps {
  commitment?: StudentCommitment;
  elapsedSeconds: number;
  saving: boolean;
  outcome?: StudyOutcome;
  reviewDays?: number;
  onOutcomeChange: (outcome: StudyOutcome) => void;
  onReviewDaysChange: (days?: number) => void;
  onSave: () => void;
}

export function StudyReflection({ commitment, elapsedSeconds, saving, outcome, reviewDays, onOutcomeChange, onReviewDaysChange, onSave }: StudyReflectionProps) {
  const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
  return (
    <section role="dialog" aria-modal="true" aria-labelledby="study-reflection-title" className="module-theme-student fixed inset-0 z-[60] overflow-y-auto bg-background px-4 py-[max(1.25rem,env(safe-area-inset-top))]">
      <div className="mx-auto max-w-2xl space-y-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <header className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12 text-primary"><AlumiaIcon icon={BookOpenCheckIcon} size="lg" /></span>
          <div>
            <h2 id="study-reflection-title" className="font-display text-2xl font-semibold">Seu tempo foi válido</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Cada momento de estudo pode contar no seu ritmo.</p>
          </div>
        </header>

        <div className="module-surface rounded-2xl border p-4">
          <p className="font-display text-xl font-semibold">Você dedicou <span className="text-primary">{elapsedMinutes} {elapsedMinutes === 1 ? "minuto" : "minutos"}</span></p>
          <p className="mt-1 text-sm text-muted-foreground">{commitment?.title || "Sessão livre de estudo"}</p>
        </div>

        <fieldset>
          <legend className="font-display text-xl font-semibold">Como foi este momento?</legend>
          <p className="mt-0.5 text-sm text-muted-foreground">Escolha o que melhor representa sua experiência agora.</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {outcomes.map((option) => (
              <button key={option.value} type="button" aria-pressed={outcome === option.value} onClick={() => onOutcomeChange(option.value)} className={`flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border px-2 text-center text-sm font-semibold ${outcome === option.value ? "border-primary bg-primary/12 text-primary" : "border-border bg-surface"}`}>
                <AlumiaIcon icon={option.icon} size="md" />{option.label}
              </button>
            ))}
          </div>
        </fieldset>

        {commitment && (
          <fieldset className="border-t border-border pt-5">
            <legend className="font-display text-xl font-semibold">Quer revisar depois?</legend>
            <p className="mt-0.5 text-sm text-muted-foreground">Se escolher uma data, criaremos um novo compromisso de revisão.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {reviewOptions.map((option) => (
                <button key={option.days} type="button" aria-pressed={reviewDays === option.days} onClick={() => onReviewDaysChange(reviewDays === option.days ? undefined : option.days)} className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold ${reviewDays === option.days ? "border-primary bg-primary/12 text-primary" : "border-input bg-surface"}`}>
                  <AlumiaIcon icon={CalendarAdd01Icon} size="xs" />{option.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div className="space-y-2 pt-2">
          <Button size="lg" className="w-full" disabled={saving} onClick={onSave}>{saving ? "Salvando…" : "Salvar e voltar"}</Button>
          {reviewDays && <button type="button" className="min-h-11 w-full text-sm font-semibold text-primary underline-offset-4 hover:underline" onClick={() => onReviewDaysChange(undefined)}>Encerrar sem agendar revisão</button>}
        </div>
      </div>
    </section>
  );
}
