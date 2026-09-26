import type { ReactNode } from "react";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";

export function InfoCard({ children }: { children: ReactNode }) {
  return (
    <section className="flex h-full items-center gap-2.5 rounded-[1.125rem] border border-primary/20 bg-primary/10 px-3 py-2.5 text-foreground shadow-[var(--shadow-card)] sm:px-4">
      <AlumiaIcon icon={SparklesIcon} size="sm" className="shrink-0 text-primary" />
      <p className="text-sm font-medium leading-snug sm:text-base">{children}</p>
    </section>
  );
}
