import { useEffect, useState } from "react";
import { CareList, EmotionalCheckinCard, HydrationCard, InfoCard, ModulesGrid } from "@/components/shared/home";
import { InlineFeedback } from "@/components/ui/surface";
import { getLocalDateString, isSameLocalDay } from "@/lib/utils";
import { getTasks } from "@/services/tasksService";
import type { Task } from "@/types";

export function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = () => {
    setLoading(true);
    setError(null);
    getTasks()
      .then(setTasks)
      .catch(() => setError("Não conseguimos carregar seus cuidados agora."))
      .finally(() => setLoading(false));
  };

  useEffect(() => loadTasks(), []);

  const today = getLocalDateString();
  const completedToday = tasks.filter((task) => (
    task.done && (task.completed_at ? isSameLocalDay(task.completed_at) : task.date === today)
  )).length;
  const message = loading
    ? "Preparando seus cuidados com calma…"
    : completedToday === 0
      ? "Ainda não fizemos nadinha hoje. Tudo bem, no seu tempo."
      : completedToday === 1
        ? "Você já fez 1 coisinha importante hoje."
        : `Você já fez ${completedToday} coisinhas importantes hoje.`;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]">
        <div className="lg:col-start-2 lg:row-start-1">
          <EmotionalCheckinCard />
        </div>
        <div className="lg:col-start-1 lg:row-start-1">
          <InfoCard>{message}</InfoCard>
        </div>
      </div>
      {error && <InlineFeedback tone="danger">{error} <button type="button" onClick={loadTasks} className="font-semibold underline">Tentar novamente</button></InlineFeedback>}

      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]">
        <CareList tasks={tasks} loading={loading} onRefresh={loadTasks} />
        <div className="space-y-3">
          <HydrationCard />
          <ModulesGrid />
        </div>
      </div>
    </div>
  );
}
