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
      <section className="relative min-h-40 overflow-hidden sm:min-h-56 lg:sticky lg:top-0 lg:h-svh">
        <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-auth-background to-transparent lg:h-40" />
        <div className="absolute left-5 top-[max(1.25rem,calc(env(safe-area-inset-top)+0.5rem))] flex items-center gap-2 rounded-2xl bg-surface/90 px-3 py-2 text-foreground shadow-sm backdrop-blur sm:left-8 sm:top-[max(2rem,calc(env(safe-area-inset-top)+0.5rem))]">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <AlumiaIcon icon={SparklesIcon} size="sm" />
          </span>
          <span className="font-display text-base font-bold">Alumia</span>
        </div>
      </section>
      <section className="flex min-h-[calc(100svh-10rem)] items-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:min-h-[calc(100svh-14rem)] sm:px-6 lg:min-h-svh lg:px-8 lg:pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:pt-[max(1.5rem,env(safe-area-inset-top))]">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </section>
    </main>
  );
}
