import { HugeiconsIcon } from "@hugeicons/react";
import { Happy01Icon } from "@hugeicons/core-free-icons";

/**
 * MoodCard — faixa de registro de humor do dia.
 * Design original: pill lavanda simples com texto centralizado.
 */
export function MoodCard() {
  return (
    <section
      aria-label="Como está seu humor hoje"
      className="flex items-center justify-center gap-2 rounded-xl bg-tone-lavender px-4 py-3 text-sm font-medium text-tone-lavender-fg sm:text-base"
    >
      <HugeiconsIcon icon={Happy01Icon} size={18} strokeWidth={1.5} className="shrink-0" />
      <span>Como está o seu humor hoje?</span>
    </section>
  );
}
