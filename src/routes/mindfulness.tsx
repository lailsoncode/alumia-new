import { createFileRoute } from "@tanstack/react-router";
import { MindfulnessPage } from "@/pages/MindfulnessPage";

export const Route = createFileRoute("/mindfulness")({
  component: MindfulnessPage,
});
