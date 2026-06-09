import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/pages/SettingsPage";
import { RequireAuth } from "@/lib/RequireAuth";

export const Route = createFileRoute("/ajustes")({
  component: () => (
    <RequireAuth>
      <SettingsPage />
    </RequireAuth>
  ),
});
