import { Link, useLocation } from "@tanstack/react-router";
import { CheckListIcon, Grid2X2Icon, Home01Icon, Settings01Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { cn } from "@/lib/utils";
import { isItemActive } from "./navigation-utils";

const items = [
  { to: "/", label: "Início", icon: Home01Icon, matches: ["/"] },
  { to: "/tarefas", label: "Tarefas", icon: CheckListIcon, matches: ["/tarefas"] },
  { to: "/modulos", label: "Cuidados", icon: Grid2X2Icon, matches: ["/modulos", "/hidratacao"] },
  { to: "/ajustes", label: "Ajustes", icon: Settings01Icon, matches: ["/ajustes", "/completar-perfil"] },
] as const;

export function BottomNavigation() {
  const { pathname } = useLocation();
  return (
    <nav aria-label="Navegação principal" className="alumia-floating fixed inset-x-4 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto max-w-lg rounded-[1.75rem] p-1.5 lg:hidden">
      <ul className="grid grid-cols-4 gap-1">
        {items.map((item) => {
          const active = isItemActive(pathname, item.matches);
          return (
            <li key={item.to} className="min-w-0">
              <Link
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-[1.25rem] px-1 text-xs font-semibold transition-colors",
                  active ? "bg-tone-sky text-tone-sky-fg" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <AlumiaIcon icon={item.icon} size="md" strokeWidth={active ? 2 : 1.6} />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SidebarNavigation() {
  const { pathname } = useLocation();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar px-5 py-7 lg:flex lg:flex-col">
      <Link to="/" className="flex items-center gap-3 rounded-xl px-2 py-1 text-sidebar-foreground">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <AlumiaIcon icon={SparklesIcon} size="md" />
        </span>
        <span>
          <span className="block font-display text-xl font-bold">Alumia</span>
          <span className="block text-xs text-muted-foreground">Cuidado no seu ritmo</span>
        </span>
      </Link>

      <nav aria-label="Navegação principal" className="mt-10">
        <ul className="space-y-2">
          {items.map((item) => {
            const active = isItemActive(pathname, item.matches);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-semibold transition-colors",
                    active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <AlumiaIcon icon={item.icon} size="sm" strokeWidth={active ? 2 : 1.6} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto rounded-[1.5rem] bg-tone-lavender p-5 text-tone-lavender-fg shadow-[var(--shadow-card)]">
        <p className="font-display text-sm font-semibold">Seu espaço continua aqui.</p>
        <p className="mt-1 text-xs leading-relaxed opacity-80">Volte quando fizer sentido para você.</p>
      </div>
    </aside>
  );
}
