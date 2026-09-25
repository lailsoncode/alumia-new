import { useNavigate } from "@tanstack/react-router";
import { Settings01Icon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { MODULE_THEMES } from "@/lib/module-themes";

const modules = [
  { ...MODULE_THEMES.tasks, to: "/tarefas" as const },
  { ...MODULE_THEMES.checkin, to: "/check-in" as const },
  { ...MODULE_THEMES.hydration, to: "/hidratacao" as const },
];

export function ModulesGrid() {
  const navigate = useNavigate();
  return (
    <Surface className="rounded-[1.25rem] p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <AlumiaIcon icon={Settings01Icon} size="md" className="text-primary" />
        <h2 className="text-lg font-semibold">Seus módulos ativos</h2>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {modules.map((module) => (
          <button key={module.key} type="button" onClick={() => navigate({ to: module.to })} className={`module-whisper flex min-h-12 min-w-0 items-center gap-1.5 rounded-[0.875rem] border px-2 text-left text-sm font-medium text-foreground transition-colors hover:-translate-y-px ${module.themeClass}`}>
            <AlumiaIcon icon={module.icon} size="sm" className="module-text shrink-0" />
            <span className="truncate">{module.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <Button className="min-h-11" variant="outline" size="sm" onClick={() => navigate({ to: "/modulos" })}>Editar meus módulos</Button>
      </div>
    </Surface>
  );
}
