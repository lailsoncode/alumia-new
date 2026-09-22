import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout";
import { Greeting } from "@/components/shared/Greeting";
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
    ? "Preparando o seu dia com calma…"
    : pendingToday.length === 0
      ? "Não há nada esperando por você agora. Aproveite esse espaço."
      : `${pendingToday.length} ${pendingToday.length === 1 ? "cuidado pode receber" : "cuidados podem receber"} sua atenção hoje.`;

  return (
    <AppShell>
      <div className="space-y-6">
        <Greeting />
        <InfoCard>{message}</InfoCard>
        {error && <InlineFeedback tone="danger">{error} <button type="button" onClick={loadTasks} className="font-semibold underline">Tentar novamente</button></InlineFeedback>}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]">
          <CareList tasks={tasks} loading={loading} onRefresh={loadTasks} />
          <div className="space-y-6">
            <HydrationCard />
            <ModulesGrid />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
