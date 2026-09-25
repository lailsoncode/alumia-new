import { useEffect, useState } from "react";
import { CareList, HydrationCard, InfoCard, ModulesGrid } from "@/components/shared/home";
import { InlineFeedback } from "@/components/ui/surface";
import { getLocalDateString } from "@/lib/utils";
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
  const pendingToday = tasks.filter((task) => !task.done && (task.date ? task.date <= today : true));
  const message = loading
    ? "Preparando seus cuidados com calma…"
    : pendingToday.length === 0
      ? "Hoje não há nada pedindo sua atenção. Tudo bem — este espaço também é seu."
      : pendingToday.length === 1
        ? "Há um cuidado esperando por você hoje. Sem pressa, no seu ritmo."
        : `Há ${pendingToday.length} cuidados esperando por você hoje. Um gesto de cada vez.`;

  return (
    <div className="space-y-4">
      <InfoCard>{message}</InfoCard>
      {error && <InlineFeedback tone="danger">{error} <button type="button" onClick={loadTasks} className="font-semibold underline">Tentar novamente</button></InlineFeedback>}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]">
        <CareList tasks={tasks} loading={loading} onRefresh={loadTasks} />
        <div className="space-y-4">
          <HydrationCard />
          <ModulesGrid />
        </div>
      </div>
    </div>
  );
}
