import { createFileRoute } from "@tanstack/react-router";
import { AlumiaAIPage } from "@/pages/AlumiaAIPage";

export const Route = createFileRoute("/alumia")({
  component: AlumiaAIPage,
});
