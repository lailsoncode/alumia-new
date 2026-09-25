import { BellIcon, Calendar01Icon, Clock01Icon, Flag01Icon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { MODULE_THEMES, resolveModuleKey } from "@/lib/module-themes";
import { getLocalDateString } from "@/lib/utils";
import type { Task } from "@/types";

interface TaskItemProps { task: Task; onToggle?: (id: string) => void; }

function formatTaskDate(dateString?: string) {
  if (!dateString) return "";
  if (dateString === getLocalDateString()) return "Hoje";
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) return "Amanhã";
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}

export function TaskItem({ task, onToggle }: TaskItemProps) {
  const priorityTone = task.priority === "alta" ? "text-destructive" : task.priority === "media" ? "text-warning-foreground" : "text-info-foreground";
  const moduleKey = resolveModuleKey(task.moduleKey ?? task.module_key);
  const moduleTheme = MODULE_THEMES[moduleKey];
  return (
    <li data-module={moduleKey} className={`${moduleTheme.themeClass} module-whisper flex min-h-16 items-center gap-2.5 rounded-[1.125rem] border p-2.5 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5 ${task.done ? "opacity-65" : ""}`}>
      <button type="button" aria-label={task.done ? `Marcar ${task.title} como pendente` : `Concluir ${task.title}`} onClick={() => onToggle?.(task.id)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-muted">
        <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${task.done ? "border-primary bg-primary" : "border-primary/55"}`}>{task.done && <span className="h-2 w-2 rounded-full bg-primary-foreground" />}</span>
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold leading-snug text-foreground sm:text-base ${task.done ? "line-through" : ""}`}>{task.title}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-muted-foreground">
          {moduleKey !== "tasks" && <span className="module-text inline-flex items-center gap-1 font-medium"><AlumiaIcon icon={moduleTheme.icon} size="xs" />{moduleTheme.label}</span>}
          {task.date && <span className="inline-flex items-center gap-1"><AlumiaIcon icon={Calendar01Icon} size="xs" />{formatTaskDate(task.date)}</span>}
          {task.time && <span className="inline-flex items-center gap-1"><AlumiaIcon icon={Clock01Icon} size="xs" />{task.time}</span>}
          {(task.reminder || task.hasBell) && <span className="inline-flex items-center gap-1"><AlumiaIcon icon={BellIcon} size="xs" />Lembrete</span>}
          {(task.priority || task.hasFlag) && <span className={`inline-flex items-center gap-1 ${priorityTone}`}><AlumiaIcon icon={Flag01Icon} size="xs" />{task.priority === "alta" ? "Importante" : task.priority === "media" ? "Média" : "Baixa"}</span>}
        </div>
      </div>
    </li>
  );
}
