import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { StarIcon, Clock01Icon, AlertCircleIcon, AddCircleIcon } from "@hugeicons/core-free-icons";
import type { Task, AddTaskData } from "../../../types";
import { getTasks, createTask, updateTask } from "../../../services/tasksService";
import { TaskItem } from "./TaskItem";
import { AddTaskSheet } from "./AddTaskSheet";
import { DatePickerSheet } from "./DatePickerSheet";

type Tab = "hoje" | "em_breve";

/**
 * TasksView — View principal da tela de tarefas.
 */
export function TasksView() {
  const [tab, setTab] = useState<Tab>("hoje");
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [dateSheetOpen, setDateSheetOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrega as tarefas do banco de dados na inicialização
  useEffect(() => {
    getTasks()
      .then((data) => {
        setTasks(data);
      })
      .catch((err) => {
        console.error("Erro ao carregar tarefas:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const toggleDone = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const newDone = !task.done;

    // Atualização otimista
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: newDone } : t)));

    try {
      await updateTask(id, { done: newDone });
    } catch (err) {
      console.error("Erro ao atualizar status da tarefa:", err);
      // Reverte em caso de erro
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: task.done } : t)));
    }
  };

  const handleCreateTask = async (data: AddTaskData) => {
    try {
      const newTask = await createTask(data);
      setTasks((prev) => [...prev, newTask]);
    } catch (err) {
      console.error("Erro ao criar tarefa:", err);
    }
  };

  // Lógica de Rollover Automático: tarefas passadas não concluídas acumulam hoje
  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Hoje - Importantes: date <= hoje e prioridade "alta" (se concluída, apenas se date === hoje)
  const importantTasks = tasks.filter(
    (t) =>
      t.priority === "alta" &&
      t.date &&
      ((!t.done && t.date <= todayStr) || (t.done && t.date === todayStr)),
  );

  // 2. Hoje - Agendadas: date <= hoje e prioridade diferente de "alta" (se concluída, apenas se date === hoje)
  const scheduledTasks = tasks.filter(
    (t) =>
      t.priority !== "alta" &&
      t.date &&
      ((!t.done && t.date <= todayStr) || (t.done && t.date === todayStr)),
  );

  // 3. Hoje - Pode esperar: sem data e não concluídas
  const backlogTasks = tasks.filter((t) => !t.date && !t.done);

  // 4. Em breve: tarefas futuras (date > hoje) e não concluídas
  const upcomingTasks = tasks.filter((t) => t.date && t.date > todayStr && !t.done);

  const sections = [
    {
      title: "O que você disse que importa hoje",
      icon: StarIcon,
      color: "text-tone-sun-fg",
      tasks: importantTasks,
    },
    {
      title: "O que você marcou pra hoje",
      icon: Clock01Icon,
      color: "text-tone-peach-fg",
      tasks: scheduledTasks,
    },
    {
      title: "Pode esperar",
      icon: AlertCircleIcon,
      color: "text-tone-mint-fg",
      tasks: backlogTasks,
    },
  ];

  return (
    <div className="relative min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-4 pb-32 pt-6 sm:px-6 sm:pt-8">
        <div className="space-y-4">
          {/* Banner de informações */}
          <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-tone-lavender text-2xl">
              💡
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                Como a Alumia organiza seus gestos?
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                Primeiro, o que você marcou como importante. Depois, o que tem horário. E por fim, o
                que pode esperar.{" "}
                <span className="font-medium text-foreground">
                  Sempre no seu ritmo. Sem pressa, sem cobrança.
                </span>
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            {(["hoje", "em_breve"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-semibold transition-colors sm:text-base ${tab === t ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t === "hoje" ? "hoje" : "em breve"}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12 text-sm text-muted-foreground">
              Carregando suas tarefas com leveza...
            </div>
          ) : tab === "hoje" ? (
            sections.map((sec, idx) => (
              <section key={idx}>
                {sec.tasks.length > 0 && (
                  <>
                    <h2 className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-foreground sm:text-base">
                      <HugeiconsIcon
                        icon={sec.icon}
                        size={16}
                        strokeWidth={1.5}
                        className={sec.color}
                      />
                      {sec.title}
                    </h2>
                    <ul className="space-y-1.5 mb-6">
                      {sec.tasks.map((task) => (
                        <TaskItem key={task.id} task={task} onToggle={toggleDone} />
                      ))}
                    </ul>
                  </>
                )}
              </section>
            ))
          ) : (
            <section>
              <h2 className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-foreground sm:text-base">
                <HugeiconsIcon
                  icon={Clock01Icon}
                  size={16}
                  strokeWidth={1.5}
                  className="text-tone-sky-fg"
                />
                Próximas tarefas
              </h2>
              {upcomingTasks.length > 0 ? (
                <ul className="space-y-1.5">
                  {upcomingTasks.map((task) => (
                    <TaskItem key={task.id} task={task} onToggle={toggleDone} />
                  ))}
                </ul>
              ) : (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  Nenhuma tarefa agendada para os próximos dias.
                </p>
              )}
            </section>
          )}

          {/* Fallback quando não há tarefas hoje */}
          {!loading &&
            tab === "hoje" &&
            importantTasks.length === 0 &&
            scheduledTasks.length === 0 &&
            backlogTasks.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Nenhuma tarefa para hoje. Aproveite o seu dia com tranquilidade! ✨
              </div>
            )}
        </div>
      </main>

      {/* FAB */}
      <button
        type="button"
        aria-label="Adicionar tarefa"
        onClick={() => setAddSheetOpen(true)}
        className="fixed bottom-24 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg transition-transform hover:scale-105 active:scale-95 sm:right-8"
      >
        <HugeiconsIcon
          icon={AddCircleIcon}
          size={24}
          strokeWidth={1.5}
          className="text-primary-foreground"
        />
      </button>

      <AddTaskSheet
        open={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        onSave={handleCreateTask}
      />
      <DatePickerSheet open={dateSheetOpen} onClose={() => setDateSheetOpen(false)} />
    </div>
  );
}
