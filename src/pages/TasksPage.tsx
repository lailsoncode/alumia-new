import { AppShell } from "@/components/layout";
import { Greeting } from "@/components/shared/Greeting";
import { TasksView } from "@/components/shared/tasks/TasksView";

export function TasksPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <Greeting role="Organize o seu dia, do seu jeito." />
        <TasksView />
      </div>
    </AppShell>
  );
}
