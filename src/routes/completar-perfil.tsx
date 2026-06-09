import { createFileRoute } from "@tanstack/react-router";
import { CompleteProfilePage } from "../pages/CompleteProfilePage";
import { RequireAuth } from "@/lib/RequireAuth";

export const Route = createFileRoute("/completar-perfil")({
  component: () => (
    <RequireAuth>
      <CompleteProfilePage />
    </RequireAuth>
  ),
});
