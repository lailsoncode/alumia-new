import type { ReactNode } from "react";
import { ALUMIA_AVATAR_IMAGES } from "@/lib/alumia-avatar";

export function InfoCard({ children }: { children: ReactNode }) {
  return (
    <section className="flex h-full items-center gap-3 overflow-hidden rounded-[1.125rem] border border-primary/20 bg-primary/10 pr-3 text-foreground shadow-[var(--shadow-card)] sm:pr-4">
      <img src={ALUMIA_AVATAR_IMAGES.companion} alt="Alumia" className="h-20 w-20 shrink-0 self-stretch object-cover object-[52%_32%] sm:h-24 sm:w-24" />
      <div className="py-2.5"><p className="text-xs font-semibold uppercase tracking-wide text-primary">Alumia por aqui</p><p className="mt-1 text-sm font-medium leading-snug sm:text-base">{children}</p></div>
    </section>
  );
}
