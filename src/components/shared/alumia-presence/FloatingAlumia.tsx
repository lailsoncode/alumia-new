import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { AiBrain01Icon, ArrowRight01Icon, Mic01Icon, SentIcon, SparklesIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  ALUMIA_PRESENCE_CHANGE_EVENT,
  getAlumiaPresenceContext,
  getAlumiaPresenceEnabled,
  setAlumiaPendingMessage,
} from "@/lib/alumia-presence";
import { RiveAlumia } from "./RiveAlumia";

export function FloatingAlumia() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [message, setMessage] = useState("");
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

  const continueInChat = (event: FormEvent) => {
    event.preventDefault();
    const text = message.trim();
    if (!text) return;
    setAlumiaPendingMessage(text);
    setMessage("");
    goTo("/alumia");
  };

  const handleMessageKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Conversar com a Alumia"
          className="group fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] left-3 z-30 h-24 w-20 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:hidden"
        >
          <span aria-hidden="true" className="alumia-presence-halo absolute bottom-1 left-1/2 h-14 w-14 -translate-x-1/2 rounded-full bg-primary/18 blur-sm" />
          <RiveAlumia className="alumia-presence-idle relative h-full w-full object-contain object-bottom drop-shadow-[0_7px_7px_rgba(38,42,62,0.28)] transition-transform group-hover:scale-[1.04] group-active:scale-95" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="start"
        sideOffset={-2}
        collisionPadding={12}
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="w-[min(22rem,calc(100vw-1.5rem))] overflow-visible rounded-[1.5rem] border-primary/20 bg-background p-0 shadow-[0_18px_50px_rgba(35,46,67,0.22)]"
      >
        <div className="rounded-t-[1.5rem] bg-primary/8 px-4 pb-3 pt-3.5">
          <p className="flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-primary">
            <AlumiaIcon icon={SparklesIcon} size="xs" />
            Alumia
          </p>
          <h2 className="mt-1 font-display text-lg font-semibold leading-tight">{content.title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{content.message}</p>
        </div>

        <div className="grid gap-2 border-b border-border/70 p-3 sm:grid-cols-2" aria-label="Atalhos rápidos da Alumia">
          <Button type="button" size="sm" onClick={() => goTo("/alumia")}>
            <AlumiaIcon icon={AiBrain01Icon} size="sm" />
            Conversar comigo
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => goTo(content.secondaryAction.to)}>
            {content.secondaryAction.label}
            <AlumiaIcon icon={ArrowRight01Icon} size="sm" />
          </Button>
        </div>

        <form onSubmit={continueInChat} className="space-y-2.5 p-3">
          <p className="text-xs font-semibold text-muted-foreground">Ou escreva uma mensagem</p>
          <label htmlFor="alumia-quick-message" className="sr-only">Mensagem para a Alumia</label>
          <Textarea
            id="alumia-quick-message"
            value={message}
            onChange={(event) => setMessage(event.target.value.slice(0, 500))}
            onKeyDown={handleMessageKeyDown}
            rows={2}
            placeholder="O que você precisa agora?"
            className="max-h-28 min-h-16 resize-none rounded-xl bg-surface text-base"
          />

          <div className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-1.5 text-xs text-muted-foreground">
              <button
                type="button"
                disabled
                aria-label="Enviar áudio — em breve"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted/60"
              >
                <AlumiaIcon icon={Mic01Icon} size="sm" />
              </button>
              <span>Áudio em breve</span>
            </div>
            <Button type="submit" size="sm" disabled={!message.trim()}>
              Enviar
              <AlumiaIcon icon={SentIcon} size="sm" />
            </Button>
          </div>
        </form>

        <span aria-hidden="true" className="absolute -bottom-2 left-8 h-4 w-4 rotate-45 border-b border-r border-primary/20 bg-background" />
      </PopoverContent>
    </Popover>
  );
}
