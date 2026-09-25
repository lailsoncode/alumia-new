import { Sad01Icon, SmileIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { cn } from "@/lib/utils";
import type { CheckinEmotion, EmotionValence } from "@/types";

interface EmotionPickerProps {
  emotions: CheckinEmotion[];
  value: string[];
  onChange: (codes: string[]) => void;
  error?: string;
}

const groups: Array<{
  valence: EmotionValence;
  title: string;
  description: string;
  icon: typeof SmileIcon;
}> = [
  {
    valence: "positive",
    title: "Emoções agradáveis",
    description: "Escolha até 3 que combinam com seu momento.",
    icon: SmileIcon,
  },
  {
    valence: "difficult",
    title: "Emoções difíceis",
    description: "Escolha até 3 que descrevem o que está difícil hoje.",
    icon: Sad01Icon,
  },
];

export function EmotionPicker({ emotions, value, onChange, error }: EmotionPickerProps) {
  return (
    <fieldset aria-describedby={error ? "emotion-error" : undefined}>
      <legend className="sr-only">Como você está se sentindo?</legend>
      <div className="space-y-5">
        {groups.map((group) => {
          const options = emotions.filter((emotion) => emotion.valence === group.valence);
          if (options.length === 0) return null;

          return (
            <section key={group.valence} aria-labelledby={`emotion-${group.valence}-title`}>
              <div className="flex items-start gap-2">
                <AlumiaIcon icon={group.icon} size="sm" className="module-text mt-0.5" />
                <div>
                  <h2 id={`emotion-${group.valence}-title`} className="text-base font-semibold sm:text-lg">
                    {group.title}
                  </h2>
                  <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">{group.description}</p>
                </div>
              </div>
              <div className="mt-2.5 flex flex-wrap justify-center gap-2">
                {options.map((emotion) => {
                  const selected = value.includes(emotion.code);
                  const selectedInGroup = options.filter((option) => value.includes(option.code)).length;
                  const limitReached = !selected && selectedInGroup >= 3;
                  return (
                    <button
                      key={emotion.code}
                      type="button"
                      aria-pressed={selected}
                      disabled={limitReached}
                      onClick={() => onChange(
                        selected ? value.filter((code) => code !== emotion.code) : [...value, emotion.code],
                      )}
                      className={cn(
                        "min-h-10 rounded-xl border px-3 py-2 text-sm font-medium transition-[background-color,border-color,color,transform] sm:text-base",
                        limitReached && "cursor-not-allowed opacity-45",
                        selected
                          ? "module-surface border-[var(--module-accent)] text-[var(--module-strong)] shadow-sm"
                          : "border-border bg-surface text-foreground hover:border-[var(--module-border)] hover:bg-surface-subtle",
                      )}
                    >
                      {emotion.label} <span aria-hidden="true">{emotion.emoji}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
      {error && <p id="emotion-error" className="mt-3 text-sm font-medium text-destructive">{error}</p>}
    </fieldset>
  );
}
