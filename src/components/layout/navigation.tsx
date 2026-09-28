import { Link, useLocation } from "@tanstack/react-router";
import { CheckListIcon, Grid2X2Icon, Home01Icon, Settings01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import alumiaChibi from "@/assets/alumia/alumia-chibi-idle-v1.png";
import { cn } from "@/lib/utils";
import { isItemActive } from "./navigation-utils";

const items = [
  { to: "/", label: "Início", icon: Home01Icon, matches: ["/"] },
  { to: "/tarefas", label: "Tarefas", icon: CheckListIcon, matches: ["/tarefas"] },
  { to: "/modulos", label: "Cuidados", icon: Grid2X2Icon, matches: ["/modulos", "/hidratacao", "/check-in", "/estudante", "/mindfulness", "/financeiro", "/alumia"] },
  { to: "/perfil", label: "Meu perfil", icon: UserIcon, matches: ["/perfil", "/completar-perfil", "/conquistas"] },
  { to: "/ajustes", label: "Ajustes", icon: Settings01Icon, matches: ["/ajustes"] },
] as const;

export function BottomNavigation() {
  const { pathname } = useLocation();
  return (
    <nav aria-label="Navegação principal" className="alumia-floating fixed inset-x-2 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto max-w-xl rounded-[1.5rem] p-1 lg:hidden sm:inset-x-4">
      <ul className="grid grid-cols-5 gap-0.5 sm:gap-1">
        {items.map((item) => {
          const active = isItemActive(pathname, item.matches);
          return (
            <li key={item.to} className="min-w-0">
              <Link
                to={item.to}
                preload="render"
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-13 min-w-0 flex-col items-center justify-center gap-0.5 rounded-[1.125rem] px-0.5 text-[0.68rem] font-semibold transition-colors sm:px-1 sm:text-xs",
                  active ? "bg-primary/12 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar px-5 py-5 lg:flex lg:flex-col">
      <Link to="/" className="flex items-center gap-3 rounded-xl px-2 py-1 text-sidebar-foreground">
        <img
          src="/icons/alumia-icon-192.png"
          alt=""
          aria-hidden="true"
          className="h-11 w-11 shrink-0 rounded-xl object-cover shadow-sm"
        />
        <span>
          <span className="block font-display text-xl font-bold">Alumia</span>
          <span className="block text-xs text-muted-foreground">Cuidado no seu ritmo</span>
        </span>
      </Link>

      <nav aria-label="Navegação principal" className="mt-7">
        <ul className="space-y-1">
          {items.map((item) => {
            const active = isItemActive(pathname, item.matches);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  preload="render"
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors",
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

      <div className="mt-auto overflow-hidden rounded-[1.5rem] border border-primary/20 bg-primary/10 text-foreground shadow-[var(--shadow-card)]">
        <div className="relative h-32 overflow-hidden bg-gradient-to-b from-primary/5 to-primary/15">
          <span aria-hidden="true" className="absolute bottom-2 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-primary/15 blur-md" />
          <img src={alumiaChibi} alt="Alumia acenando e segurando uma flor" className="relative mx-auto h-full w-28 object-contain object-bottom drop-shadow-md" />
        </div>
        <div className="p-4"><p className="font-display text-sm font-semibold">A Alumia segue por aqui.</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Volte quando fizer sentido para você.</p></div>
      </div>
    </aside>
  );
}
