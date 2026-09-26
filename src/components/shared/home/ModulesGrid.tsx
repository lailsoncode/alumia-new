import { useNavigate } from "@tanstack/react-router";
import { Settings01Icon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { MODULE_THEMES } from "@/lib/module-themes";

const modules = [
  { ...MODULE_THEMES.tasks, to: "/tarefas" as const },
  { ...MODULE_THEMES.checkin, to: "/check-in" as const },
  { ...MODULE_THEMES.hydration, to: "/hidratacao" as const },
];

export function ModulesGrid() {
  const navigate = useNavigate();
  return (
    <section>
      <div className="flex items-center gap-2.5 px-0.5">
        <AlumiaIcon icon={Settings01Icon} size="sm" className="text-primary" />
        <h2 className="text-base font-semibold sm:text-lg">Seus módulos ativos</h2>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {modules.map((module) => (
          <button key={module.key} type="button" onClick={() => navigate({ to: module.to })} className={`module-whisper flex min-h-11 min-w-0 items-center gap-1.5 rounded-xl border px-2.5 text-left text-sm font-medium text-foreground transition-colors hover:-translate-y-px ${module.themeClass}`}>
            <AlumiaIcon icon={module.icon} size="sm" className="module-text shrink-0" />
            <span className="truncate">{module.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex justify-end">
        <Button className="min-h-9 rounded-lg px-2.5 text-xs" variant="outline" size="sm" onClick={() => navigate({ to: "/modulos" })}>Editar meus módulos</Button>
      </div>
    </section>
  );
}
