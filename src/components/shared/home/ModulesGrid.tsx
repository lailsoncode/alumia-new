import { HugeiconsIcon } from "@hugeicons/react";
import {
  Robot01Icon,
  CheckListIcon,
  StudyDeskIcon,
  Yoga01Icon,
  GlassWaterIcon,
  SmileIcon,
  Grid02Icon,
} from "@hugeicons/core-free-icons";
import { Link } from "@tanstack/react-router";

const modules = [
  { label: "Alum.IA", icon: Robot01Icon },
  { label: "Tarefas", icon: CheckListIcon },
  { label: "Estudante", icon: StudyDeskIcon },
  { label: "Mindfulness", icon: Yoga01Icon },
  { label: "Hidratação", icon: GlassWaterIcon },
  { label: "Check-in", icon: SmileIcon },
];

/**
 * ModulesGrid — grade dos módulos ativos do usuário.
 * Botões retangulares com cantos arredondados moderados e ícones HugeIcons.
 */
export function ModulesGrid() {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground sm:text-base">
        <HugeiconsIcon
          icon={Grid02Icon}
          size={16}
          strokeWidth={1.5}
          className="text-tone-sky-fg shrink-0"
        />
        Seus módulos ativos
      </h2>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {modules.map((m) => {
          const isTasks = m.label === "Tarefas";
          const content = (
            <>
              <HugeiconsIcon
                icon={m.icon}
                size={20}
                strokeWidth={1.5}
                className="shrink-0 text-tone-sky-fg"
              />
              <span className="truncate">{m.label}</span>
            </>
          );

          if (isTasks) {
            return (
              <Link
                key={m.label}
                to="/tarefas"
                className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted cursor-pointer"
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={m.label}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {content}
            </button>
          );
        })}
      </div>
    </section>
  );
}
