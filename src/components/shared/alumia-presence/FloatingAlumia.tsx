import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { AiBrain01Icon, ArrowRight01Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ALUMIA_PRESENCE_CHANGE_EVENT,
  getAlumiaPresenceContext,
  getAlumiaPresenceEnabled,
} from "@/lib/alumia-presence";
import { RiveAlumia } from "./RiveAlumia";

export function FloatingAlumia() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const content = getAlumiaPresenceContext(pathname);

  useEffect(() => {
    setEnabled(getAlumiaPresenceEnabled());

    const updatePresence = (event: Event) => {
      setEnabled((event as CustomEvent<{ enabled: boolean }>).detail.enabled);
    };

    window.addEventListener(ALUMIA_PRESENCE_CHANGE_EVENT, updatePresence);
    return () => window.removeEventListener(ALUMIA_PRESENCE_CHANGE_EVENT, updatePresence);
  }, []);

  if (!enabled || pathname.startsWith("/alumia")) return null;

  const goTo = (to: string) => {
    setOpen(false);
    void navigate({ to });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Conversar com a Alumia"
          className="group fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] left-3 z-30 h-24 w-20 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:hidden"
        >
          <span aria-hidden="true" className="alumia-presence-halo absolute bottom-1 left-1/2 h-14 w-14 -translate-x-1/2 rounded-full bg-primary/18 blur-sm" />
          <RiveAlumia className="alumia-presence-idle relative h-full w-full object-contain object-bottom drop-shadow-[0_7px_7px_rgba(38,42,62,0.28)] transition-transform group-hover:scale-[1.04] group-active:scale-95" />
        </button>
      </SheetTrigger>

      <SheetContent side="bottom" className="rounded-t-[1.75rem] border-border bg-background px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-6">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center gap-3 pr-8">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-primary/10">
              <RiveAlumia alt="Alumia" className="h-full w-full object-contain object-bottom" />
            </div>
            <SheetHeader className="text-left">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                <AlumiaIcon icon={SparklesIcon} size="xs" />
                Alumia
              </p>
              <SheetTitle className="font-display text-xl">{content.title}</SheetTitle>
              <SheetDescription className="leading-relaxed">{content.message}</SheetDescription>
            </SheetHeader>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Button type="button" onClick={() => goTo("/alumia")}>
              <AlumiaIcon icon={AiBrain01Icon} size="sm" />
              Conversar comigo
            </Button>
            <Button type="button" variant="outline" onClick={() => goTo(content.secondaryAction.to)}>
              {content.secondaryAction.label}
              <AlumiaIcon icon={ArrowRight01Icon} size="sm" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
