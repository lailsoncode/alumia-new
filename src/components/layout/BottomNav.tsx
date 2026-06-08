import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  CheckListIcon,
  Grid2X2Icon,
  Message01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { Link, useLocation } from "@tanstack/react-router";

const tabs = [
  { to: "/", label: "Início", icon: Home01Icon, enabled: true },
  { to: "/tarefas", label: "Tarefas", icon: CheckListIcon, enabled: true },
  { to: "/modulos", label: "Módulos", icon: Grid2X2Icon, enabled: true },
  { to: "/", label: "Comunidade", icon: Message01Icon, enabled: false },
  { to: "/ajustes", label: "Ajustes", icon: Settings01Icon, enabled: true },
] as const;

/**
 * BottomNav — barra de navegação inferior fixa.
 * Usa HugeIcons para os ícones de cada aba.
 */
export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-[0_-4px_16px_rgba(0,0,0,0.02)]"
    >
      <ul className="mx-auto flex max-w-md items-center justify-around px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {tabs.map((t, idx) => {
          const isActive = t.enabled && pathname === t.to;
          return (
            <li key={`${t.label}-${idx}`} className="flex justify-center flex-1">
              <Link
                to={t.to}
                aria-label={t.label}
                aria-disabled={!t.enabled}
                className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : t.enabled
                      ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                      : "pointer-events-none text-muted-foreground/25"
                }`}
              >
                <HugeiconsIcon icon={t.icon} size={22} strokeWidth={isActive ? 2 : 1.5} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
