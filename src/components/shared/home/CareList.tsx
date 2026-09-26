import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AddCircleIcon, SparklesIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { SectionHeader, Surface } from "@/components/ui/surface";
import { getLocalDateString } from "@/lib/utils";
import { createTask, updateTask } from "@/services/tasksService";
import type { AddTaskData, Task } from "@/types";
import { AddTaskSheet } from "../tasks/AddTaskSheet";
import { TaskItem } from "../tasks/TaskItem";

interface CareListProps {
  tasks: Task[];
  loading: boolean;
  onRefresh: () => void;
}

export function CareList({ tasks, loading, onRefresh }: CareListProps) {
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);
  const today = getLocalDateString();
  const pending = tasks
    .filter((task) => !task.done && (task.date ? task.date <= today : true))
    .sort((a, b) => (a.priority === "alta" && b.priority !== "alta" ? -1 : 0));

  const completeTask = async (id: string) => {
    await updateTask(id, { done: true });
    onRefresh();
  };

  const addTask = async (data: AddTaskData) => {
    await createTask(data);
    onRefresh();
  };

  return (
    <Surface className="module-theme-tasks p-3 sm:p-4">
      <SectionHeader
        title="Gestos para hoje"
        icon={SparklesIcon}
        iconClassName="text-tone-sun-fg"
      />

      {loading ? (
        <div className="mt-2.5 space-y-1" aria-label="Carregando cuidados">
          {[0, 1, 2].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-muted" />)}
        </div>
      ) : pending.length === 0 ? (
        <div className="mt-2.5 rounded-xl bg-surface-subtle px-3 py-3.5 text-center shadow-inner">
          <AlumiaIcon icon={SparklesIcon} size="md" className="mx-auto text-tone-sun-fg" />
          <p className="mt-2 font-display text-base font-semibold text-foreground">Tudo tranquilo por aqui.</p>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">Hoje não há nenhum gesto pendente. Aproveite esse espaço ou adicione algo quando fizer sentido.</p>
        </div>
      ) : (
        <ul className="mt-2.5 space-y-1">
          {pending.slice(0, 1).map((task) => (
            <TaskItem key={task.id} task={task} onToggle={completeTask} />
          ))}
        </ul>
      )}

      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-border/70 pt-2">
        <p className="text-sm text-muted-foreground">{pending.length ? `${pending.length} ${pending.length === 1 ? "cuidado" : "cuidados"} para hoje` : "Tudo em paz por aqui"}</p>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="sm" className="px-2.5" onClick={() => navigate({ to: "/tarefas" })}>Ver todas</Button>
          <Button variant="outline" size="sm" className="px-2.5" onClick={() => setSheetOpen(true)}>
            <AlumiaIcon icon={AddCircleIcon} size="xs" />
            Adicionar
          </Button>
        </div>
      </div>

      <AddTaskSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onSave={addTask} />
    </Surface>
  );
}
