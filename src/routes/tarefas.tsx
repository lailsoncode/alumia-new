import { createFileRoute } from "@tanstack/react-router";
import { TasksPage } from "@/pages/TasksPage";
import { RequireAuth } from "@/lib/RequireAuth";

export const Route = createFileRoute("/tarefas")({
  component: () => (
    <RequireAuth>
      <TasksPage />
    </RequireAuth>
  ),
});
