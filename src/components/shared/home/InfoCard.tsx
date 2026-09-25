import type { ReactNode } from "react";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";

export function InfoCard({ children }: { children: ReactNode }) {
  return (
    <section className="flex h-full items-center gap-3 rounded-[1.5rem] border border-primary/20 bg-primary/10 px-4 py-3.5 text-foreground shadow-[var(--shadow-card)] sm:px-5">
      <AlumiaIcon icon={SparklesIcon} size="md" className="shrink-0 text-primary" />
      <p className="text-sm font-medium leading-relaxed sm:text-base">{children}</p>
    </section>
  );
}
