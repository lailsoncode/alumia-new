import { createFileRoute } from "@tanstack/react-router";
import { CheckinPage } from "@/pages/CheckinPage";

export const Route = createFileRoute("/check-in")({
  component: CheckinPage,
});
