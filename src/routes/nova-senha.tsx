import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordPage } from "../pages/ResetPasswordPage";

export const Route = createFileRoute("/nova-senha")({
  component: ResetPasswordPage,
});
