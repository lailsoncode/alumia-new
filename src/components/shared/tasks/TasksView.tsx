import { useEffect, useState } from "react";
import { AddCircleIcon, AlertCircleIcon, BulbIcon, Clock01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { InlineFeedback, Surface } from "@/components/ui/surface";
import { getLocalDateString } from "@/lib/utils";
import { createTask, getTasks, updateTask } from "@/services/tasksService";
import type { AddTaskData, Task } from "@/types";
import tasksImage from "@/assets/tasks.webp";
import { AddTaskSheet } from "./AddTaskSheet";
import { TaskItem } from "./TaskItem";

type Tab = "hoje" | "em_breve";

export function TasksView() {
  const [tab, setTab] = useState<Tab>("hoje");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getTasks().then(setTasks).catch(() => setError("Não foi possível carregar suas tarefas.")).finally(() => setLoading(false));
  };
  useEffect(() => load(), []);

  const toggleDone = async (id: string) => {
    const current = tasks.find((task) => task.id === id);
    if (!current) return;
    const done = !current.done;
    setTasks((items) => items.map((task) => task.id === id ? { ...task, done } : task));
    try { await updateTask(id, { done }); }
    catch {
      setTasks((items) => items.map((task) => task.id === id ? current : task));
      setError("A alteração não foi salva. Tente novamente.");
    }
  };

  const create = async (data: AddTaskData) => {
    try {
      const createdTask = await createTask(data);
      setTasks((items) => [...items, createdTask]);
    }
    catch { setError("Não foi possível adicionar essa tarefa."); }
  };

  const today = getLocalDateString();
  const important = tasks.filter((task) => task.priority === "alta" && task.date && ((!task.done && task.date <= today) || (task.done && task.date === today)));
  const scheduled = tasks.filter((task) => task.priority !== "alta" && task.date && ((!task.done && task.date <= today) || (task.done && task.date === today)));
  const backlog = tasks.filter((task) => !task.date && !task.done);
  const upcoming = tasks.filter((task) => task.date && task.date > today && !task.done);
  const sections = [
    {
      title: "Importa hoje",
      icon: StarIcon,
      tone: "text-tone-sun-fg",
      tasks: important,
      empty: "Ainda não há cuidados importantes para hoje. Você pode criar o primeiro quando quiser.",
    },
    {
      title: "Marcado para hoje",
      icon: Clock01Icon,
      tone: "text-tone-sky-fg",
      tasks: scheduled,
      empty: "Nada com data definida para hoje. Seu tempo continua livre.",
    },
    {
      title: "Pode esperar",
      icon: AlertCircleIcon,
      tone: "text-tone-peach-fg",
      tasks: backlog,
      empty: "Nada esperando sem data. Que bom ter esse espaço.",
    },
  ];

  return (
    <section>
      <Surface className="module-surface overflow-hidden p-2 sm:p-2.5">
        <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2.5 min-[380px]:grid-cols-[5rem_minmax(0,1fr)] sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-3">
          <img src={tasksImage} alt="Personagem da Alumia organizando ideias com calma" className="h-20 w-full rounded-lg object-cover sm:h-24" />
          <div>
            <h2 className="flex items-start gap-1.5 font-display text-sm font-semibold leading-snug text-foreground sm:text-base">
              <AlumiaIcon icon={BulbIcon} size="sm" className="mt-0.5 shrink-0 text-tone-sun-fg" />
              Como a Alumia organiza seus gestos?
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Primeiro, o que é importante. Depois, o que tem data ou horário. Por fim, o que pode esperar — tudo no seu ritmo, sem cobrança.
            </p>
          </div>
        </div>
      </Surface>

      {error && <div className="mt-3"><InlineFeedback tone="danger">{error} <button type="button" onClick={load} className="font-semibold underline">Tentar novamente</button></InlineFeedback></div>}

      <div className="mt-3 grid grid-cols-2 border-b border-border" role="tablist" aria-label="Período das tarefas">
        {(["hoje", "em_breve"] as const).map((value) => (
          <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)} className={`-mb-px min-h-12 border-b-2 px-4 text-sm font-semibold transition-colors ${tab === value ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"}`}>
            {value === "hoje" ? "Hoje" : "Em breve"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-3 space-y-1" aria-label="Carregando tarefas">{[0, 1, 2].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-muted" />)}</div>
      ) : tab === "hoje" ? (
        <div className="mt-3 grid gap-x-3 gap-y-2.5 xl:grid-cols-2">{sections.map((section) => (
          <section key={section.title} className={section.title === "Pode esperar" ? "xl:col-span-2" : undefined}>
            <h3 className="mb-1.5 flex items-center gap-2 text-base font-semibold">
              <AlumiaIcon icon={section.icon} size="sm" className={section.tone} />
              {section.title}
            </h3>
            {section.tasks.length ? (
              <ul className="space-y-1">{section.tasks.map((task) => <TaskItem key={task.id} task={task} onToggle={toggleDone} />)}</ul>
            ) : (
              <Surface variant="subtle" className="px-3 py-2.5 shadow-none">
                <p className="max-w-md text-sm leading-snug text-muted-foreground">{section.empty}</p>
              </Surface>
            )}
          </section>
        ))}</div>
      ) : (
        <section className="mt-3">
          <h3 className="mb-1.5 flex items-center gap-2 text-base font-semibold">
            <AlumiaIcon icon={Clock01Icon} size="sm" className="module-text" />
            Próximos cuidados
          </h3>
          {upcoming.length ? <ul className="space-y-1">{upcoming.map((task) => <TaskItem key={task.id} task={task} onToggle={toggleDone} />)}</ul> : <Surface variant="subtle" className="px-3 py-3 text-center shadow-none"><p className="font-display text-base font-semibold">Nada marcado adiante.</p><p className="mt-0.5 text-sm text-muted-foreground">Quando você agendar algo, ele aparece aqui.</p></Surface>}
        </section>
      )}

      <Button
        size="icon-lg"
        className="fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] right-5 z-30 rounded-full shadow-[var(--shadow-floating)] lg:bottom-8 lg:right-8"
        onClick={() => setSheetOpen(true)}
        aria-label="Adicionar tarefa"
      >
        <AlumiaIcon icon={AddCircleIcon} size="md" />
      </Button>
      <AddTaskSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onSave={create} />
    </section>
  );
}
