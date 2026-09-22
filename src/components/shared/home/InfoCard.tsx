import type { ReactNode } from "react";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";

export function InfoCard({ children }: { children: ReactNode }) {
  return (
    <section className="flex items-center gap-3 rounded-2xl bg-tone-lavender px-4 py-3.5 text-tone-lavender-fg sm:px-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface/65">
        <AlumiaIcon icon={SparklesIcon} size="sm" />
      </span>
      <p className="text-sm font-medium leading-relaxed sm:text-base">{children}</p>
    </section>
  );
}
