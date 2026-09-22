import type { ReactNode } from "react";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";

interface AuthLayoutProps {
  src: string;
  alt: string;
  children: ReactNode;
}

export function AuthLayout({ src, alt, children }: AuthLayoutProps) {
  return (
    <main className="min-h-svh bg-auth-background lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(28rem,0.95fr)]">
      <section className="relative min-h-56 overflow-hidden sm:min-h-72 lg:sticky lg:top-0 lg:h-svh">
        <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-auth-background to-transparent lg:h-40" />
        <div className="absolute left-5 top-5 flex items-center gap-2 rounded-2xl bg-surface/90 px-3 py-2 text-foreground shadow-sm backdrop-blur sm:left-8 sm:top-8">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <AlumiaIcon icon={SparklesIcon} size="sm" />
          </span>
          <span className="font-display text-base font-bold">Alumia</span>
        </div>
      </section>
      <section className="flex min-h-[calc(100svh-14rem)] items-center px-5 py-8 sm:min-h-[calc(100svh-18rem)] sm:px-8 lg:min-h-svh lg:px-12 lg:py-12">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </section>
    </main>
  );
}
