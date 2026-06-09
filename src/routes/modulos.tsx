import { createFileRoute } from "@tanstack/react-router";
import { ModulesPage } from "@/pages/ModulesPage";
import { RequireAuth } from "@/lib/RequireAuth";

export const Route = createFileRoute("/modulos")({
  component: () => (
    <RequireAuth>
      <ModulesPage />
    </RequireAuth>
  ),
});
