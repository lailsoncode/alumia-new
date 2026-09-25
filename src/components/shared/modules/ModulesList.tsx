import { useNavigate } from "@tanstack/react-router";
import {
  AddSquareIcon,
  AiBookIcon,
  AiBrain01Icon,
  CheckListIcon,
  GlassWaterIcon,
  Grid2X2Icon,
  SmileIcon,
  Yoga01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const activeModules = [
  {
    id: "tasks",
    name: "Tarefas",
    description: "Organize as tarefas do seu dia",
    icon: CheckListIcon,
    to: "/tarefas" as const,
    cardClass: "border-tone-lavender-fg/25 bg-tone-lavender/55",
    iconClass: "text-tone-lavender-fg",
    dividerClass: "bg-tone-lavender-fg/20",
  },
  {
    id: "hydration",
    name: "Hidratação",
    description: "Pausas para hidratação e cuidado",
    icon: GlassWaterIcon,
    to: "/hidratacao" as const,
    cardClass: "border-tone-sky-fg/25 bg-tone-sky/55",
    iconClass: "text-tone-sky-fg",
    dividerClass: "bg-tone-sky-fg/20",
  },
];

interface CatalogModule {
  id: string;
  name: string;
  icon: IconSvgElement;
  active: boolean;
  rowClass: string;
  iconClass: string;
}

const catalogModules: CatalogModule[] = [
  { id: "tasks", name: "Tarefas", icon: CheckListIcon, active: true, rowClass: "border-tone-lavender-fg/30", iconClass: "text-tone-lavender-fg" },
  { id: "hydration", name: "Hidratação", icon: GlassWaterIcon, active: true, rowClass: "border-tone-sky-fg/30", iconClass: "text-tone-sky-fg" },
  { id: "alumia-ai", name: "Alum.IA", icon: AiBrain01Icon, active: false, rowClass: "border-primary/35", iconClass: "text-primary" },
  { id: "checkin", name: "Check-in emocional", icon: SmileIcon, active: false, rowClass: "border-secondary-foreground/30", iconClass: "text-secondary-foreground" },
  { id: "mindfulness", name: "Mindfulness", icon: Yoga01Icon, active: false, rowClass: "border-tone-mint-fg/30", iconClass: "text-tone-mint-fg" },
  { id: "student", name: "Estudante", icon: AiBookIcon, active: false, rowClass: "border-tone-peach-fg/30", iconClass: "text-tone-peach-fg" },
];

export function ModulesList() {
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      <section aria-labelledby="active-modules-title">
        <div className="flex items-center gap-2.5">
          <AlumiaIcon icon={Grid2X2Icon} size="md" className="text-muted-foreground" />
          <h2 id="active-modules-title" className="font-display text-xl font-semibold tracking-tight sm:text-2xl">Módulos ativos</h2>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {activeModules.map((module) => (
            <article key={module.id} className={`flex min-h-48 flex-col rounded-[1.25rem] border p-3 text-center shadow-[var(--shadow-card)] sm:min-h-52 sm:p-4 ${module.cardClass}`}>
              <div className="flex min-h-12 items-center justify-center gap-2">
                <AlumiaIcon icon={module.icon} size="md" className={module.iconClass} />
                <h3 className="text-base font-semibold leading-tight min-[380px]:text-lg sm:text-xl">{module.name}</h3>
              </div>
              <p className="mt-2 flex flex-1 items-center justify-center text-sm leading-relaxed text-foreground/80 sm:text-base">{module.description}</p>
              <div className={`my-3 h-px w-full ${module.dividerClass}`} />
              <Button aria-label={`Acessar ${module.name.toLowerCase()}`} variant="outline" size="sm" className="mx-auto min-h-11 w-full max-w-36 bg-surface/90" onClick={() => navigate({ to: module.to })}>
                Acessar
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="available-modules-title">
        <div className="flex items-center gap-2.5">
          <AlumiaIcon icon={AddSquareIcon} size="md" className="text-muted-foreground" />
          <div>
            <h2 id="available-modules-title" className="font-display text-xl font-semibold tracking-tight sm:text-2xl">Módulos disponíveis</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Veja o que já está ativo e o que estamos preparando.</p>
          </div>
        </div>

        <div className="mt-3 grid gap-2.5 lg:grid-cols-2">
          {catalogModules.map((module) => {
            const status = module.active ? "Ativo" : "Em breve";
            const switchLabel = module.active ? `${module.name} está ativo` : `${module.name} estará disponível em breve`;

            return (
              <article key={module.id} className={`flex min-h-16 items-center gap-3 rounded-[1.125rem] border bg-surface px-4 py-2.5 shadow-[var(--shadow-card)] ${module.rowClass}`}>
                <AlumiaIcon icon={module.icon} size="md" className={`shrink-0 ${module.iconClass}`} />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold sm:text-lg">{module.name}</h3>
                  <p className="mt-0.5 text-xs font-medium text-muted-foreground">{status}</p>
                </div>
                <Switch checked={module.active} disabled aria-label={switchLabel} className="disabled:cursor-default disabled:opacity-100" />
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
