import { useNavigate } from "@tanstack/react-router";
import { CheckListIcon, GlassWaterIcon, SmileIcon, Yoga01Icon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { SectionHeader, Surface } from "@/components/ui/surface";

const activeModules = [
  { id: "tasks", name: "Tarefas", description: "Organize o que precisa da sua atenção, sem transformar o dia em cobrança.", icon: CheckListIcon, tone: "bg-tone-lavender text-tone-lavender-fg", to: "/tarefas" as const },
  { id: "hydration", name: "Hidratação", description: "Registre pausas para beber água e acompanhe seu ritmo ao longo da semana.", icon: GlassWaterIcon, tone: "bg-tone-sky text-tone-sky-fg", to: "/hidratacao" as const },
];

const upcomingModules = [
  { id: "checkin", name: "Check-in emocional", description: "Um espaço privado para perceber como você está.", icon: SmileIcon, tone: "bg-tone-mint text-tone-mint-fg" },
  { id: "mindfulness", name: "Mindfulness", description: "Práticas curtas para respirar e voltar ao presente.", icon: Yoga01Icon, tone: "bg-tone-peach text-tone-peach-fg" },
];

export function ModulesList() {
  const navigate = useNavigate();
  return (
    <div className="space-y-9">
      <section>
        <SectionHeader title="Seus cuidados" description="Recursos disponíveis agora na sua Alumia." />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {activeModules.map((module) => (
            <Surface key={module.id} as="article" variant="interactive" className="overflow-hidden">
              <div className="p-5 sm:p-6">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${module.tone}`}><AlumiaIcon icon={module.icon} size="lg" /></span>
                <h3 className="mt-5 text-xl font-semibold">{module.name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-relaxed text-muted-foreground">{module.description}</p>
                <Button className="mt-5 w-full" onClick={() => navigate({ to: module.to })}>Abrir {module.name.toLowerCase()}</Button>
              </div>
            </Surface>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Em breve" description="Estes cuidados ainda estão sendo preparados. Eles não estão ativos na sua conta." />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {upcomingModules.map((module) => (
            <Surface key={module.id} as="article" variant="subtle" className="p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${module.tone}`}><AlumiaIcon icon={module.icon} size="md" /></span>
                <div><div className="flex flex-wrap items-center gap-2"><h3 className="text-base font-semibold">{module.name}</h3><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">Em breve</span></div><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{module.description}</p></div>
              </div>
            </Surface>
          ))}
        </div>
      </section>
    </div>
  );
}
