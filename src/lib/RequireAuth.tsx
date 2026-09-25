import React, { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../hooks/use-auth";

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { user, loading, profileLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [loading, user, navigate]);

  if (loading || (user && profileLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4" role="status">
        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
          <span className="h-3 w-3 animate-pulse rounded-full bg-primary" />
          Preparando seu espaço…
        </div>
      </div>
    );
  }

  return <>{user ? children : null}</>;
}
