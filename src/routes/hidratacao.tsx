import { createFileRoute } from "@tanstack/react-router";
import { HydrationPage } from "@/pages/HydrationPage";

export const Route = createFileRoute("/hidratacao")({
  component: HydrationPage,
});
