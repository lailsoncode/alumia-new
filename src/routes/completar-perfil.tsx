import { createFileRoute } from "@tanstack/react-router";
import { CompleteProfilePage } from "../pages/CompleteProfilePage";

export const Route = createFileRoute("/completar-perfil")({
  component: CompleteProfilePage,
});
