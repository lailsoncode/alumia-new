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
    {
      title: "Importa hoje",
      icon: StarIcon,
      tone: "text-tone-sun-fg",
      iconSurface: "bg-tone-sun",
      tasks: important,
      empty: "Ainda não há cuidados importantes para hoje. Você pode criar o primeiro quando quiser.",
    },
    {
      title: "Marcado para hoje",
      icon: Clock01Icon,
      tone: "text-tone-sky-fg",
      iconSurface: "bg-tone-sky",
      tasks: scheduled,
      empty: "Nada com data definida para hoje. Seu tempo continua livre.",
    },
    {
      title: "Pode esperar",
      icon: AlertCircleIcon,
      tone: "text-tone-mint-fg",
      iconSurface: "bg-tone-mint",
      tasks: backlog,
      empty: "Nada esperando sem data. Que bom ter esse espaço.",
    },
  ];

  return (
    <section>
      <SectionHeader
        icon={StarIcon}
        iconClassName="bg-tone-lavender text-tone-lavender-fg"
        title="Seus gestos"
        description="Organize o seu dia do seu jeito. O que não couber agora pode esperar."
        action={<Button className="hidden sm:inline-flex" onClick={() => setSheetOpen(true)}><AlumiaIcon icon={AddCircleIcon} size="sm" />Adicionar tarefa</Button>}
      />

      <Surface className="mt-4 flex items-start gap-3 p-4 sm:p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-tone-sun text-tone-sun-fg">
          <AlumiaIcon icon={HelpCircleIcon} size="sm" />
        </span>
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">Como a Alumia organiza seus gestos?</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Primeiro vêm os gestos importantes, depois os que têm data e, por fim, o que pode esperar. Sem pressão, sem cobrança.
          </p>
        </div>
      </Surface>

      {error && <div className="mt-4"><InlineFeedback tone="danger">{error} <button type="button" onClick={load} className="font-semibold underline">Tentar novamente</button></InlineFeedback></div>}

      <div className="mt-5 flex gap-2 rounded-[1.4rem] bg-muted/80 p-1.5" role="tablist" aria-label="Período das tarefas">
        {(["hoje", "em_breve"] as const).map((value) => (
          <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)} className={`min-h-11 flex-1 rounded-2xl px-4 text-sm font-semibold transition-colors ${tab === value ? "bg-surface text-foreground shadow-[var(--shadow-card)]" : "text-muted-foreground hover:text-foreground"}`}>
            {value === "hoje" ? "Hoje" : "Em breve"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-5 space-y-3" aria-label="Carregando tarefas">{[0, 1, 2].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-muted" />)}</div>
      ) : tab === "hoje" ? (
        <div className="mt-6 grid gap-5 xl:grid-cols-2">{sections.map((section) => (
          <section key={section.title} className={section.title === "Pode esperar" ? "xl:col-span-2" : undefined}>
            <h3 className="mb-3 flex items-center gap-3 text-base font-semibold">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${section.iconSurface}`}>
                <AlumiaIcon icon={section.icon} size="sm" className={section.tone} />
              </span>
              {section.title}
            </h3>
            {section.tasks.length ? (
              <ul className="space-y-3">{section.tasks.map((task) => <TaskItem key={task.id} task={task} onToggle={toggleDone} />)}</ul>
            ) : (
              <Surface variant="subtle" className="px-4 py-5 sm:px-5">
                <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{section.empty}</p>
              </Surface>
            )}
          </section>
        ))}</div>
      ) : (
        <section className="mt-6">
          <h3 className="mb-3 flex items-center gap-3 text-base font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-tone-sky"><AlumiaIcon icon={Clock01Icon} size="sm" className="text-tone-sky-fg" /></span>
            Próximos cuidados
          </h3>
          {upcoming.length ? <ul className="space-y-3">{upcoming.map((task) => <TaskItem key={task.id} task={task} onToggle={toggleDone} />)}</ul> : <Surface variant="subtle" className="px-5 py-8 text-center"><p className="font-display text-lg font-semibold">Nada marcado adiante.</p><p className="mt-1 text-sm text-muted-foreground">Quando você agendar algo, ele aparece aqui.</p></Surface>}
        </section>
      )}

      <Button
        size="icon-lg"
        className="fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] right-5 z-30 rounded-full shadow-[var(--shadow-floating)] sm:hidden"
        onClick={() => setSheetOpen(true)}
        aria-label="Adicionar tarefa"
      >
        <AlumiaIcon icon={AddCircleIcon} size="md" />
      </Button>
      <AddTaskSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onSave={create} />
    </section>
  );
}
