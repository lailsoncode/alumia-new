import { BellIcon, Calendar01Icon, Clock01Icon, Flag01Icon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
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
  return (
    <li className={`flex min-h-20 items-center gap-3 rounded-[1.4rem] border border-border/80 bg-surface p-4 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5 ${task.done ? "opacity-65" : ""}`}>
      <button type="button" aria-label={task.done ? `Marcar ${task.title} como pendente` : `Concluir ${task.title}`} onClick={() => onToggle?.(task.id)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl hover:bg-muted">
        <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${task.done ? "border-primary bg-primary" : "border-primary/55"}`}>{task.done && <span className="h-2 w-2 rounded-full bg-primary-foreground" />}</span>
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold text-foreground sm:text-base ${task.done ? "line-through" : ""}`}>{task.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {task.date && <span className="inline-flex items-center gap-1"><AlumiaIcon icon={Calendar01Icon} size="xs" />{formatTaskDate(task.date)}</span>}
          {task.time && <span className="inline-flex items-center gap-1"><AlumiaIcon icon={Clock01Icon} size="xs" />{task.time}</span>}
          {(task.reminder || task.hasBell) && <span className="inline-flex items-center gap-1"><AlumiaIcon icon={BellIcon} size="xs" />Lembrete</span>}
          {(task.priority || task.hasFlag) && <span className={`inline-flex items-center gap-1 ${priorityTone}`}><AlumiaIcon icon={Flag01Icon} size="xs" />{task.priority === "alta" ? "Importante" : task.priority === "media" ? "Média" : "Baixa"}</span>}
        </div>
      </div>
    </li>
  );
}
