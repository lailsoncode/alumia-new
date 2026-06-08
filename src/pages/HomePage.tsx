import { useState, useEffect } from "react";
import { BottomNav } from "@/components/layout";
import { Greeting } from "@/components/shared/Greeting";
import { MoodCard, InfoCard, CareList, HydrationCard, ModulesGrid } from "@/components/shared/home";
import { getTasks } from "@/services/tasksService";
import type { Task } from "@/types";

export function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = () => {
    setLoading(true);
    getTasks()
      .then((data) => {
        setTasks(data);
      })
      .catch((err) => {
        console.error("Erro ao carregar tarefas na Home:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];
  const pendingToday = tasks.filter((t) => !t.done && (t.date ? t.date <= todayStr : true));
  const completedToday = tasks.filter((t) => t.done && t.date === todayStr);
  const totalToday = tasks.filter((t) => t.date ? t.date <= todayStr : !t.done);

  const getInfoMessage = () => {
    if (loading) {
      return "Buscando seus cuidados de hoje...";
    }
    if (totalToday.length === 0) {
      return "Não fizemos nadinha hoje, tudo bem, no seu tempo, sem pressa.";
    }
    if (pendingToday.length === 0) {
      return "Tudo feito por hoje! Você completou suas tarefas com carinho e leveza. 🌟";
    }
    return `Hoje você tem ${pendingToday.length} ${pendingToday.length === 1 ? "cuidado aguardando" : "cuidados aguardando"} por você. No seu tempo, sem pressa.`;
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8">
        <div className="space-y-3 sm:space-y-4">
          <Greeting />
          <MoodCard />
          <InfoCard>{getInfoMessage()}</InfoCard>
          <CareList tasks={tasks} loading={loading} onRefresh={loadTasks} />
          <HydrationCard />
          <ModulesGrid />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
