import { HugeiconsIcon } from "@hugeicons/react";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import type { ReactNode } from "react";

/**
 * InfoCard — faixa informativa simples.
 * Design original: pill muted com texto centralizado e ícone decorativo.
 */
export function InfoCard({ children }: { children: ReactNode }) {
  return (
    <section className="flex items-center justify-center gap-2 rounded-xl bg-muted px-4 py-3 text-sm text-foreground sm:text-base">
      <HugeiconsIcon
        icon={SparklesIcon}
        size={16}
        strokeWidth={1.5}
        className="shrink-0 text-tone-peach-fg"
      />
      <span className="text-center">{children}</span>
    </section>
  );
}
