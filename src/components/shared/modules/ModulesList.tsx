import { useNavigate } from "@tanstack/react-router";
import {
  AddSquareIcon,
  Grid2X2Icon,
} from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MODULE_THEMES } from "@/lib/module-themes";

const activeModules = [
  {
    ...MODULE_THEMES.tasks,
    description: "Organize as tarefas do seu dia",
    to: "/tarefas" as const,
  },
  {
    ...MODULE_THEMES.checkin,
    description: "Reconheça e acolha o que você sente",
    to: "/check-in" as const,
  },
  {
    ...MODULE_THEMES.hydration,
    description: "Pausas para hidratação e cuidado",
    to: "/hidratacao" as const,
  },
];

const catalogModules = [
  { ...MODULE_THEMES.tasks, active: true },
  { ...MODULE_THEMES.hydration, active: true },
  { ...MODULE_THEMES.checkin, active: true },
  { ...MODULE_THEMES.alumia_ai, active: false },
  { ...MODULE_THEMES.mindfulness, active: false },
  { ...MODULE_THEMES.student, active: false },
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
            <article key={module.key} className={`module-surface flex min-h-48 flex-col rounded-[1.25rem] border p-3 text-center shadow-[var(--shadow-card)] sm:min-h-52 sm:p-4 ${module.themeClass}`}>
              <div className="flex min-h-12 items-center justify-center gap-2">
                <AlumiaIcon icon={module.icon} size="md" className="module-text" />
                <h3 className="text-base font-semibold leading-tight min-[380px]:text-lg sm:text-xl">{module.label}</h3>
              </div>
              <p className="mt-2 flex flex-1 items-center justify-center text-sm leading-relaxed text-foreground/80 sm:text-base">{module.description}</p>
              <div className="module-divider my-3 h-px w-full" />
              <Button aria-label={`Acessar ${module.label.toLowerCase()}`} variant="outline" size="sm" className="mx-auto min-h-11 w-full max-w-36 bg-surface/90" onClick={() => navigate({ to: module.to })}>
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
            const switchLabel = module.active ? `${module.label} está ativo` : `${module.label} estará disponível em breve`;

            return (
              <article key={module.key} className={`module-whisper flex min-h-16 items-center gap-3 rounded-[1.125rem] border px-4 py-2.5 shadow-[var(--shadow-card)] ${module.themeClass}`}>
                <AlumiaIcon icon={module.icon} size="md" className="module-text shrink-0" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold sm:text-lg">{module.label}</h3>
                  <p className="mt-0.5 text-xs font-medium text-muted-foreground">{status}</p>
                </div>
                <Switch checked={module.active} disabled aria-label={switchLabel} className="disabled:cursor-default disabled:opacity-100 data-[state=unchecked]:bg-muted" />
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
