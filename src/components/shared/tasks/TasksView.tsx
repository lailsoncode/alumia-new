import { useEffect, useState } from "react";
import { AddCircleIcon, AlertCircleIcon, Clock01Icon, HelpCircleIcon, StarIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { InlineFeedback, SectionHeader, Surface } from "@/components/ui/surface";
import { getLocalDateString } from "@/lib/utils";
import { createTask, getTasks, updateTask } from "@/services/tasksService";
import type { AddTaskData, Task } from "@/types";
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
    { title: "Importa hoje", icon: StarIcon, tone: "text-tone-sun-fg", tasks: important },
    { title: "Marcado para hoje", icon: Clock01Icon, tone: "text-tone-peach-fg", tasks: scheduled },
    { title: "Pode esperar", icon: AlertCircleIcon, tone: "text-tone-mint-fg", tasks: backlog },
  ];
  const hasToday = important.length + scheduled.length + backlog.length > 0;

  return (
    <section>
      <SectionHeader
        title="Seus cuidados"
        description="Priorize o que fizer sentido. O restante pode esperar."
        action={<Button className="hidden sm:inline-flex" onClick={() => setSheetOpen(true)}><AlumiaIcon icon={AddCircleIcon} size="sm" />Adicionar tarefa</Button>}
      />

      <details className="mt-5 rounded-2xl border border-border bg-surface-subtle px-4 py-3 text-sm text-muted-foreground">
        <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 font-semibold text-foreground"><AlumiaIcon icon={HelpCircleIcon} size="sm" />Como a Alumia organiza esta lista?</summary>
        <p className="pb-2 pl-7 leading-relaxed">Primeiro vem o que você marcou como importante, depois o que tem data e, por fim, o que pode esperar.</p>
      </details>

      {error && <div className="mt-5"><InlineFeedback tone="danger">{error} <button type="button" onClick={load} className="font-semibold underline">Tentar novamente</button></InlineFeedback></div>}

      <div className="mt-6 flex gap-2 rounded-xl bg-muted p-1" role="tablist" aria-label="Período das tarefas">
        {(["hoje", "em_breve"] as const).map((value) => (
          <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)} className={`min-h-11 flex-1 rounded-lg px-4 text-sm font-semibold transition-colors ${tab === value ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {value === "hoje" ? "Hoje" : "Em breve"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 space-y-3" aria-label="Carregando tarefas">{[0, 1, 2].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-muted" />)}</div>
      ) : tab === "hoje" ? (
        hasToday ? <div className="mt-7 grid gap-7 xl:grid-cols-2">{sections.filter((section) => section.tasks.length).map((section) => (
          <section key={section.title} className={section.title === "Pode esperar" ? "xl:col-span-2" : undefined}>
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold"><AlumiaIcon icon={section.icon} size="sm" className={section.tone} />{section.title}</h3>
            <ul className="space-y-3">{section.tasks.map((task) => <TaskItem key={task.id} task={task} onToggle={toggleDone} />)}</ul>
          </section>
        ))}</div> : <Surface variant="subtle" className="mt-7 px-6 py-12 text-center"><p className="font-display text-lg font-semibold">Seu dia está livre.</p><p className="mt-1 text-sm text-muted-foreground">Aproveite com tranquilidade ou adicione algo quando quiser.</p></Surface>
      ) : (
        <section className="mt-7">
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold"><AlumiaIcon icon={Clock01Icon} size="sm" className="text-tone-sky-fg" />Próximos cuidados</h3>
          {upcoming.length ? <ul className="space-y-3">{upcoming.map((task) => <TaskItem key={task.id} task={task} onToggle={toggleDone} />)}</ul> : <Surface variant="subtle" className="px-6 py-12 text-center"><p className="font-display text-lg font-semibold">Nada marcado adiante.</p><p className="mt-1 text-sm text-muted-foreground">Quando você agendar algo, ele aparece aqui.</p></Surface>}
        </section>
      )}

      <Button
        size="icon-lg"
        className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-30 rounded-full shadow-lg sm:hidden"
        onClick={() => setSheetOpen(true)}
        aria-label="Adicionar tarefa"
      >
        <AlumiaIcon icon={AddCircleIcon} size="md" />
      </Button>
      <AddTaskSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onSave={create} />
    </section>
  );
}
