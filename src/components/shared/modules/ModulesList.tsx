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
    <div className="space-y-4">
      <section aria-labelledby="active-modules-title">
        <div className="flex items-center gap-2.5">
          <AlumiaIcon icon={Grid2X2Icon} size="md" className="text-muted-foreground" />
          <h2 id="active-modules-title" className="font-display text-xl font-semibold tracking-tight sm:text-2xl">Módulos ativos</h2>
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          {activeModules.map((module) => (
            <article key={module.key} className={`module-surface flex min-h-36 flex-col rounded-[1.125rem] border p-2.5 text-center shadow-[var(--shadow-card)] sm:min-h-40 sm:p-3 ${module.themeClass}`}>
              <div className="flex min-h-10 items-center justify-center gap-1.5">
                <AlumiaIcon icon={module.icon} size="sm" className="module-text" />
                <h3 className="text-base font-semibold leading-tight min-[380px]:text-lg">{module.label}</h3>
              </div>
              <p className="mt-1 flex flex-1 items-center justify-center text-xs leading-snug text-foreground/80 min-[380px]:text-sm">{module.description}</p>
              <div className="module-divider my-2 h-px w-full" />
              <Button aria-label={`Acessar ${module.label.toLowerCase()}`} variant="outline" size="sm" className="mx-auto w-full max-w-32 bg-surface/90" onClick={() => navigate({ to: module.to })}>
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
            <p className="mt-0.5 text-sm leading-snug text-muted-foreground">Veja o que já está ativo e o que estamos preparando.</p>
          </div>
        </div>

        <div className="mt-2.5 grid gap-2 lg:grid-cols-2">
          {catalogModules.map((module) => {
            const status = module.active ? "Ativo" : "Em breve";
            const switchLabel = module.active ? `${module.label} está ativo` : `${module.label} estará disponível em breve`;

            return (
              <article key={module.key} className={`module-whisper flex min-h-14 items-center gap-2.5 rounded-xl border px-3 py-1.5 shadow-none ${module.themeClass}`}>
                <AlumiaIcon icon={module.icon} size="sm" className="module-text shrink-0" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold sm:text-base">{module.label}</h3>
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
