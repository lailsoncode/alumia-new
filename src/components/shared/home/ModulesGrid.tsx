import { useNavigate } from "@tanstack/react-router";
import { CheckListIcon, GlassWaterIcon, Grid2X2Icon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Surface } from "@/components/ui/surface";

const modules = [
  { title: "Tarefas", description: "Organize o que importa", icon: CheckListIcon, to: "/tarefas" as const, tone: "bg-tone-lavender text-tone-lavender-fg" },
  { title: "Hidratação", description: "Registre cada pausa", icon: GlassWaterIcon, to: "/hidratacao" as const, tone: "bg-tone-sky text-tone-sky-fg" },
];

export function ModulesGrid() {
  const navigate = useNavigate();
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-tone-lavender text-tone-lavender-fg"><AlumiaIcon icon={Grid2X2Icon} size="sm" /></span><h2 className="text-lg font-semibold">Seus espaços de cuidado</h2></div>
        <button type="button" onClick={() => navigate({ to: "/modulos" })} className="min-h-10 text-sm font-semibold text-primary underline-offset-4 hover:underline">Gerenciar</button>
      </div>
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-1">
        {modules.map((module) => (
          <Surface key={module.title} as="article" variant="interactive">
            <button type="button" onClick={() => navigate({ to: module.to })} className="flex min-h-24 w-full items-center gap-4 p-5 text-left">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${module.tone}`}><AlumiaIcon icon={module.icon} size="md" /></span>
              <span><span className="block text-sm font-semibold text-foreground">{module.title}</span><span className="mt-0.5 block text-xs text-muted-foreground">{module.description}</span></span>
            </button>
          </Surface>
        ))}
      </div>
    </section>
  );
}
