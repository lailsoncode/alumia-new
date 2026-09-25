import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AddCircleIcon, BellIcon, Calendar01Icon, Clock01Icon, Flag01Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { SectionHeader, Surface } from "@/components/ui/surface";
import { getLocalDateString } from "@/lib/utils";
import { createTask, updateTask } from "@/services/tasksService";
import type { AddTaskData, Task } from "@/types";
import { AddTaskSheet } from "../tasks/AddTaskSheet";

interface CareListProps {
  tasks: Task[];
  loading: boolean;
  onRefresh: () => void;
}

function formatTaskDate(dateString?: string) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const today = getLocalDateString();
  if (dateString === today) return "Hoje";
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
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
    <Surface className="p-4 sm:p-5">
      <SectionHeader
        title="Gestos para hoje"
        description="O que merece atenção primeiro, sempre no seu ritmo."
        icon={SparklesIcon}
        iconClassName="text-tone-sun-fg"
        action={<Button variant="outline" size="sm" className="min-h-11 w-11 px-0 sm:w-auto sm:px-3" onClick={() => setSheetOpen(true)} aria-label="Adicionar tarefa"><AlumiaIcon icon={AddCircleIcon} size="xs" /><span className="hidden sm:inline">Adicionar</span></Button>}
      />

      {loading ? (
        <div className="mt-5 space-y-3" aria-label="Carregando cuidados">
          {[0, 1, 2].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-muted" />)}
        </div>
      ) : pending.length === 0 ? (
        <div className="mt-5 rounded-[1.4rem] bg-surface-subtle px-4 py-6 text-center shadow-inner">
          <AlumiaIcon icon={SparklesIcon} size="md" className="mx-auto text-tone-sun-fg" />
          <p className="mt-3 font-display text-base font-semibold text-foreground">Tudo tranquilo por aqui.</p>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">Hoje não há nenhum gesto pendente. Aproveite esse espaço ou adicione algo quando fizer sentido.</p>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {pending.slice(0, 3).map((task) => (
            <li key={task.id} className="flex min-h-20 items-center gap-3 rounded-[1.25rem] bg-surface-subtle/75 p-3.5 transition-colors hover:bg-surface-subtle">
              <button type="button" onClick={() => completeTask(task.id)} aria-label={`Concluir ${task.title}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-success/60">
                <span className="h-5 w-5 rounded-full border-2 border-primary/55" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground sm:text-base">{task.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  {task.date && <span className="inline-flex items-center gap-1"><AlumiaIcon icon={Calendar01Icon} size="xs" />{formatTaskDate(task.date)}</span>}
                  {task.time && <span className="inline-flex items-center gap-1"><AlumiaIcon icon={Clock01Icon} size="xs" />{task.time}</span>}
                  {task.reminder && <AlumiaIcon icon={BellIcon} size="xs" label="Com lembrete" />}
                  {task.priority && <AlumiaIcon icon={Flag01Icon} size="xs" label={`Prioridade ${task.priority}`} className={task.priority === "alta" ? "text-destructive" : "text-muted-foreground"} />}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
        <p className="text-sm text-muted-foreground">{pending.length ? `${pending.length} ${pending.length === 1 ? "cuidado" : "cuidados"} para hoje` : "Tudo em paz por aqui"}</p>
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/tarefas" })}>Ver todas</Button>
      </div>

      <AddTaskSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onSave={addTask} />
    </Surface>
  );
}
