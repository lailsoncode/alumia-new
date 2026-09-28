import { useEffect, useRef, useState } from "react";
import { AddCircleIcon, AlertCircleIcon, BulbIcon, CheckmarkCircle01Icon, Clock01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { InlineFeedback, Surface } from "@/components/ui/surface";
import { getLocalDateString, isSameLocalDay } from "@/lib/utils";
import { createTask, deleteTask, getTasks, updateTask } from "@/services/tasksService";
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
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [recentlyCompletedIds, setRecentlyCompletedIds] = useState<Set<string>>(() => new Set());
  const completionTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const load = (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    getTasks().then(setTasks).catch(() => setError("Não foi possível carregar suas tarefas.")).finally(() => {
      if (showLoading) setLoading(false);
    });
  };
  useEffect(() => {
    load();
    const timers = completionTimers.current;
    const receiveSynchronizedTasks = (event: Event) => {
      setTasks((event as CustomEvent<Task[]>).detail);
      setLoading(false);
    };
    window.addEventListener("alumia:tasks-synchronized", receiveSynchronizedTasks);
    return () => {
      window.removeEventListener("alumia:tasks-synchronized", receiveSynchronizedTasks);
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  const toggleDone = async (id: string) => {
    const current = tasks.find((task) => task.id === id);
    if (!current) return;
    const done = !current.done;
    const isActiveRecurrence = Boolean(current.recurrence?.active);
    const previousTimer = completionTimers.current.get(id);
    if (previousTimer) clearTimeout(previousTimer);
    completionTimers.current.delete(id);
    setRecentlyCompletedIds((ids) => {
      const next = new Set(ids);
      if (done && !isActiveRecurrence) next.add(id);
      else next.delete(id);
      return next;
    });
    setTasks((items) => items.map((task) => task.id === id ? { ...task, done } : task));
    try {
      const updated = await updateTask(id, { done });
      setTasks((items) => items.map((task) => task.id === id ? { ...task, ...updated, recurrence: task.recurrence } : task));
      if (done && isActiveRecurrence) {
        load(false);
      } else if (done) {
        const timer = setTimeout(() => {
          setRecentlyCompletedIds((ids) => {
            const next = new Set(ids);
            next.delete(id);
            return next;
          });
          completionTimers.current.delete(id);
        }, 1800);
        completionTimers.current.set(id, timer);
      }
    }
    catch {
      setTasks((items) => items.map((task) => task.id === id ? current : task));
      setRecentlyCompletedIds((ids) => {
        const next = new Set(ids);
        next.delete(id);
        return next;
      });
      setError("A alteração não foi salva. Tente novamente.");
    }
  };

  const create = async (data: AddTaskData) => {
    try {
      const createdTask = await createTask(data);
      setTasks((items) => [...items, createdTask]);
    }
    catch (createError) { setError("Não foi possível adicionar essa tarefa."); throw createError; }
  };

  const edit = async (data: AddTaskData) => {
    if (!editingTask) return;
    try {
      const updated = await updateTask(editingTask.id, {
        title: data.title,
        description: data.description,
        date: data.date ?? null,
        time: data.time ?? null,
        priority: data.priority,
        reminder: data.reminder,
        moduleKey: editingTask.moduleKey ?? editingTask.module_key,
        recurrence: data.recurrence ?? null,
      });
      setTasks((items) => items.map((task) => task.id === editingTask.id ? { ...task, ...updated } : task));
      setEditingTask(null);
    } catch (editError) {
      setError("Não foi possível editar essa tarefa.");
      throw editError;
    }
  };

  const remove = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteTask(pendingDelete.id);
      const timer = completionTimers.current.get(pendingDelete.id);
      if (timer) clearTimeout(timer);
      completionTimers.current.delete(pendingDelete.id);
      setTasks((items) => items.filter((task) => task.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch {
      setError("Não foi possível excluir essa tarefa.");
    } finally {
      setDeleting(false);
    }
  };

  const today = getLocalDateString();
  const byTime = (first: Task, second: Task) => (first.time || "23:59").localeCompare(second.time || "23:59");
  const isPendingOrFinishing = (task: Task) => !task.done || recentlyCompletedIds.has(task.id);
  const important = tasks.filter((task) => task.priority === "alta" && task.date === today && isPendingOrFinishing(task)).sort(byTime);
  const scheduled = tasks.filter((task) => task.priority !== "alta" && task.date === today && isPendingOrFinishing(task)).sort(byTime);
  const backlog = tasks.filter((task) => !task.date && isPendingOrFinishing(task));
  const upcoming = tasks.filter((task) => task.date && task.date > today && !task.done).sort((first, second) => `${first.date} ${first.time || "23:59"}`.localeCompare(`${second.date} ${second.time || "23:59"}`));
  const completedToday = tasks.filter((task) => task.done && !recentlyCompletedIds.has(task.id) && (task.completed_at ? isSameLocalDay(task.completed_at) : task.date === today));
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

      {error && <div className="mt-3"><InlineFeedback tone="danger">{error} <button type="button" onClick={() => load()} className="font-semibold underline">Tentar novamente</button></InlineFeedback></div>}

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
              <ul className="space-y-1">{section.tasks.map((task) => <TaskItem key={task.id} task={task} onToggle={toggleDone} onEdit={setEditingTask} onDelete={setPendingDelete} />)}</ul>
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
          {upcoming.length ? <ul className="space-y-1">{upcoming.map((task) => <TaskItem key={task.id} task={task} onToggle={toggleDone} onEdit={setEditingTask} onDelete={setPendingDelete} />)}</ul> : <Surface variant="subtle" className="px-3 py-3 text-center shadow-none"><p className="font-display text-base font-semibold">Nada marcado adiante.</p><p className="mt-0.5 text-sm text-muted-foreground">Quando você agendar algo, ele aparece aqui.</p></Surface>}
        </section>
      )}

      {completedToday.length > 0 && (
        <details className="mt-3 rounded-xl border border-border bg-surface-subtle px-3 py-2">
          <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 text-sm font-semibold text-muted-foreground marker:hidden">
            <AlumiaIcon icon={CheckmarkCircle01Icon} size="sm" className="text-primary" />
            Realizadas hoje · {completedToday.length}
          </summary>
          <ul className="mt-1 space-y-1 border-t border-border pt-2">
            {completedToday.map((task) => <TaskItem key={task.id} task={task} onToggle={toggleDone} onDelete={setPendingDelete} />)}
          </ul>
        </details>
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
      {editingTask && (
        <AddTaskSheet
          key={editingTask.id}
          open
          title="Editar tarefa"
          submitLabel="Salvar alterações"
          onClose={() => setEditingTask(null)}
          onSave={edit}
          initialTitle={editingTask.title}
          initialDescription={editingTask.description ?? ""}
          initialDate={editingTask.date}
          initialTime={editingTask.time}
          initialPriority={editingTask.priority}
          initialReminder={editingTask.reminder}
          initialRecurrence={editingTask.recurrence ? { frequency: editingTask.recurrence.frequency, weekdays: editingTask.recurrence.weekdays } : null}
          moduleKey={editingTask.moduleKey ?? editingTask.module_key}
        />
      )}
      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent className="mx-4 max-w-sm rounded-2xl p-5">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir esta tarefa?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.recurrence?.active ? "A tarefa e sua repetição serão removidas. " : ""}Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter tarefa</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleting} onClick={(event) => { event.preventDefault(); void remove(); }}>
              {deleting ? "Excluindo…" : "Excluir tarefa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
