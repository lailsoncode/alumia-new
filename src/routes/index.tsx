import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { HomePage } from "@/pages/HomePage";
import { LandingPage } from "@/pages/LandingPage";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const { user, loading } = useAuth();

  return !loading && user ? <HomePage /> : <LandingPage />;
}
