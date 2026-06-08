import { TasksView } from "@/components/shared/tasks/TasksView";
import { Greeting } from "@/components/shared/Greeting";
import { BottomNav } from "@/components/layout";

/**
 * TasksPage — página de tarefas do usuário.
 * Exibe o Greeting, a TasksView com tabs (Hoje / Em breve) e a navegação inferior.
 */
export function TasksPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 pt-6 sm:px-6 sm:pt-8">
        <Greeting role="Organize o seu dia, do seu jeito" />
      </div>
      <TasksView />
      <BottomNav />
    </div>
  );
}
