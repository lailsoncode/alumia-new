import { useEffect } from "react";
import { Outlet, Link, createRootRoute, HeadContent, Scripts, useLocation } from "@tanstack/react-router";

import { AppShell } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { RequireAuth } from "@/lib/RequireAuth";
import { applyTheme, getStoredTheme } from "@/lib/theme";
import type { ModuleKey } from "@/lib/module-themes";
import { AuthProvider } from "@/providers/AuthProvider";
import { initializeOneSignal, isOneSignalConfigured, synchronizeOneSignalUser } from "@/services/oneSignalService";
import { registerPwaServiceWorker } from "@/services/pwaService";
import appCss from "../styles.css?url";

const appShellHeaders = {
  "/": "Que bom ter você aqui. Vamos com calma, no seu ritmo.",
  "/tarefas": "Organize o seu dia, do seu jeito.",
  "/modulos": "Escolha o que faz sentido para você agora. Um passo de cada vez.",
  "/check-in": "Vamos cuidar de como você está se sentindo?",
  "/check-in/historico": "Seus sentimentos, acolhidos no seu tempo.",
  "/hidratacao": "Cada gole é um gesto de carinho com você.",
  "/ajustes": "Sua conta, suas preferências e sua privacidade.",
} as const;

const protectedPaths = new Set([...Object.keys(appShellHeaders), "/completar-perfil"]);

const routeModules: Partial<Record<keyof typeof appShellHeaders, ModuleKey>> = {
  "/tarefas": "tasks",
  "/check-in": "checkin",
  "/check-in/historico": "checkin",
  "/hidratacao": "hydration",
};

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          O endereço que você tentou acessar não existe ou foi movido.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Alumia — seu espaço de cuidado diário" },
      {
        name: "description",
        content:
          "Alumia: organize seus cuidados, hidratação e tarefas com leveza.",
      },
      { name: "author", content: "Alumia" },
      { property: "og:title", content: "Alumia — seu espaço de cuidado diário" },
      {
        property: "og:description",
        content: "Cuide de você com leveza: tarefas, hidratação e mais.",
      },
      { property: "og:type", content: "website" },
      { name: "theme-color", content: "#f8f7fb" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/icons/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/icons/favicon-16x16.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/icons/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Kodchasan:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RuntimeIntegrations() {
  const { user, loading } = useAuth();

  useEffect(() => {
    applyTheme(getStoredTheme());
    void registerPwaServiceWorker().catch((error) => console.error("Erro ao registrar a PWA:", error));
    if (isOneSignalConfigured()) {
      void initializeOneSignal().catch((error) => console.error("Erro ao iniciar notificações:", error));
    }
  }, []);

  useEffect(() => {
    if (loading || !isOneSignalConfigured()) return;
    void synchronizeOneSignalUser(user?.id ?? null).catch((error) => console.error("Erro ao sincronizar notificações:", error));
  }, [loading, user?.id]);

  return null;
}

function ApplicationContent() {
  const { pathname } = useLocation();
  const isProtected = protectedPaths.has(pathname);
  const usesAppShell = Object.hasOwn(appShellHeaders, pathname);
  const content = usesAppShell ? (
    <AppShell
      headerRole={appShellHeaders[pathname as keyof typeof appShellHeaders]}
      moduleKey={routeModules[pathname as keyof typeof appShellHeaders]}
    >
      <Outlet />
    </AppShell>
  ) : (
    <Outlet />
  );

  return isProtected ? <RequireAuth>{content}</RequireAuth> : content;
}

function RootComponent() {
  return (
    <AuthProvider>
      <RuntimeIntegrations />
      <ApplicationContent />
    </AuthProvider>
  );
}
