import { HelpCircleIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { cn } from "@/lib/utils";
import type { CheckinNeed } from "@/types";

interface NeedPickerProps {
  needs: CheckinNeed[];
  value: string;
  onChange: (code: string) => void;
  error?: string;
}
export function NeedPicker({ needs, value, onChange, error }: NeedPickerProps) {
  return (
    <fieldset aria-describedby={error ? "need-error" : undefined}>
      <legend className="sr-only">O que está mais presente no seu dia hoje?</legend>
      <div className="flex items-start gap-2">
        <AlumiaIcon icon={HelpCircleIcon} size="sm" className="module-text mt-0.5" />
        <div>
          <h2 className="text-base font-semibold sm:text-lg">O que você precisa neste momento?</h2>
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">Escolha uma opção.</p>
        </div>
      </div>
      <div className="mx-auto mt-2.5 grid max-w-2xl grid-cols-2 gap-2">
        {needs.map((need) => {
          const selected = value === need.code;
          return (
            <button
              key={need.code}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(need.code)}
              className={cn(
                "min-h-11 rounded-xl border px-2.5 py-2 text-sm font-medium leading-tight transition-[background-color,border-color,color,transform] sm:px-3 sm:text-base",
                need.code === "just_record" && "col-span-2 mx-auto w-full max-w-sm",
                selected
                  ? "module-surface border-[var(--module-accent)] text-[var(--module-strong)] shadow-sm"
                  : "border-border bg-surface text-foreground hover:border-[var(--module-border)] hover:bg-surface-subtle",
              )}
            >
              {need.label} <span aria-hidden="true">{need.emoji}</span>
            </button>
          );
        })}
      </div>
      {error && <p id="need-error" className="mt-3 text-sm font-medium text-destructive">{error}</p>}
    </fieldset>
  );
}
