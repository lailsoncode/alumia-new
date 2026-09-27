import { createFileRoute } from "@tanstack/react-router";
import { StudentPage } from "@/pages/StudentPage";

export const Route = createFileRoute("/estudante")({
  component: StudentPage,
});
