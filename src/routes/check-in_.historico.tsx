import { createFileRoute } from "@tanstack/react-router";
import { CheckinHistoryPage } from "@/pages/CheckinHistoryPage";

export const Route = createFileRoute("/check-in_/historico")({
  component: CheckinHistoryPage,
});
