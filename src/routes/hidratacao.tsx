import { createFileRoute } from "@tanstack/react-router";
import { HydrationPage } from "@/pages/HydrationPage";
import { RequireAuth } from "@/lib/RequireAuth";

export const Route = createFileRoute("/hidratacao")({
  component: () => (
    <RequireAuth>
      <HydrationPage />
    </RequireAuth>
  ),
});
