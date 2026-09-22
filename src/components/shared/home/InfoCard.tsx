import type { ReactNode } from "react";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";

export function InfoCard({ children }: { children: ReactNode }) {
  return (
    <section className="flex items-center gap-4 rounded-[1.5rem] border border-border bg-tone-lavender px-5 py-4.5 text-tone-lavender-fg shadow-[var(--shadow-card)] sm:px-6">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface/65">
        <AlumiaIcon icon={SparklesIcon} size="sm" />
      </span>
      <p className="text-sm font-medium leading-relaxed sm:text-base">{children}</p>
    </section>
  );
}
