import { createRouter, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { routeTree } from "./routeTree.gen";

function DefaultErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  const message = error instanceof Error ? error.message : String(error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlumiaIcon icon={Alert02Icon} size="xl" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Algo não saiu como esperado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tente novamente. Se o problema continuar, volte ao início.
        </p>
        {import.meta.env.DEV && message && (
          <pre className="mt-4 max-h-40 overflow-auto rounded-xl bg-muted p-3 text-left font-mono text-xs text-destructive">
            {message}
          </pre>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-input bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Voltar ao início
          </a>
        </div>
      </div>
    </div>
  );
}

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadDelay: 50,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent,
  });

  return router;
};
