import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar01Icon,
  Clock01Icon,
  BellIcon,
  Flag01Icon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import type { Task } from "../../../types";

interface TaskItemProps {
  task: Task;
  onToggle?: (id: string) => void;
  onMenu?: (id: string) => void;
}

function formatTaskDate(dateStr: string | undefined) {
  if (!dateStr) return "";
  try {
    // Se for formato de mock (ex: "10 jan."), mantemos
    if (
      dateStr.includes("jan") ||
      dateStr.includes("fev") ||
      dateStr.includes("mar") ||
      dateStr.includes("abr") ||
      dateStr.includes("mai") ||
      dateStr.includes("jun") ||
      dateStr.includes("jul") ||
      dateStr.includes("ago") ||
      dateStr.includes("set") ||
      dateStr.includes("out") ||
      dateStr.includes("nov") ||
      dateStr.includes("dez")
    ) {
      return dateStr;
    }

    // Parse YYYY-MM-DD
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    ) {
      return "Hoje";
    }

    if (
      d.getDate() === tomorrow.getDate() &&
      d.getMonth() === tomorrow.getMonth() &&
      d.getFullYear() === tomorrow.getFullYear()
    ) {
      return "Amanhã";
    }

    return d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
  } catch (e) {
    return dateStr;
  }
}

/**
 * TaskItem — Linha individual de tarefa.
 * Exibe radio circle, título, metadados (data, hora, sino, bandeira) e botão de menu.
 */
export function TaskItem({ task, onToggle, onMenu }: TaskItemProps) {
  return (
    <li
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
        task.highlighted
          ? "border-tone-lavender-fg/20 bg-tone-lavender"
          : "border-border bg-background"
      } ${task.done ? "opacity-60" : ""}`}
    >
      {/* Radio circle */}
      <button
        type="button"
        aria-label={task.done ? "Marcar como pendente" : "Marcar como concluída"}
        onClick={() => onToggle?.(task.id)}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          task.done
            ? "border-primary bg-primary"
            : "border-muted-foreground/40 bg-transparent hover:border-primary/60"
        }`}
      >
        {task.done && <span className="block h-2 w-2 rounded-full bg-card" />}
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-semibold text-foreground sm:text-base ${
            task.done ? "line-through" : ""
          }`}
        >
          {task.title}
        </p>
        {(task.date || task.time || task.reminder || task.hasBell || task.priority || task.hasFlag) && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            {task.date && (
              <>
                <HugeiconsIcon icon={Calendar01Icon} size={11} strokeWidth={1.5} />
                <span>{formatTaskDate(task.date)}</span>
              </>
            )}
            {task.time && (
              <>
                <span className="mx-0.5">·</span>
                <HugeiconsIcon icon={Clock01Icon} size={11} strokeWidth={1.5} />
                <span>{task.time}</span>
              </>
            )}
            {(task.reminder || task.hasBell) && (
              <>
                <span className="mx-0.5">·</span>
                <HugeiconsIcon icon={BellIcon} size={11} strokeWidth={1.5} />
              </>
            )}
            {(task.priority || task.hasFlag) && (
              <>
                <span className="mx-0.5">·</span>
                <HugeiconsIcon
                  icon={Flag01Icon}
                  size={11}
                  strokeWidth={1.5}
                  className={
                    task.priority === "alta" || task.hasFlag
                      ? "text-red-500 fill-red-500/10"
                      : task.priority === "media"
                        ? "text-yellow-500 fill-yellow-500/10"
                        : "text-blue-500 fill-blue-500/10"
                  }
                />
              </>
            )}
          </p>
        )}
      </div>

      {/* More menu */}
      <button
        type="button"
        aria-label="Opções da tarefa"
        onClick={() => onMenu?.(task.id)}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <HugeiconsIcon icon={MoreHorizontalIcon} size={16} strokeWidth={1.5} />
      </button>
    </li>
  );
}
