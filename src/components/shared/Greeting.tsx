import { SparklesIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { useAuth } from "@/hooks/use-auth";

interface GreetingProps {
  name?: string;
  role?: string;
  avatarUrl?: string;
}

function getPeriodGreeting(hour: number) {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

/**
 * Componente de saudação contextual.
 * Exibe o nome do usuário, a saudação baseada no período do dia, o contexto da tela e um avatar.
 */
export function Greeting({ name: propName, role, avatarUrl: propAvatarUrl }: GreetingProps) {
  const { user, profile } = useAuth();
  const greeting = getPeriodGreeting(new Date().getHours());
  const name = propName || profile?.firstName || user?.email?.split("@")[0] || "você";
  const profileAvatar = profile?.avatarUrl && !profile.avatarUrl.startsWith("blob:") ? profile.avatarUrl : "";
  const avatarUrl = propAvatarUrl && !propAvatarUrl.startsWith("blob:") ? propAvatarUrl : profileAvatar;

  const initials = (name || "V")
    .split(" ")
    .filter(Boolean)
    .map((p) => [...p][0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="-mx-4 -mt-4 border-b border-border bg-surface px-4 pt-3 sm:-mx-5 sm:-mt-5 sm:px-5 lg:-mx-6 lg:-mt-6 lg:px-6">
      <div className="flex items-center justify-between gap-3 pb-3">
        <div className="min-w-0 flex-1">
          <h1 className="flex flex-wrap items-center gap-x-2 font-display text-xl font-semibold tracking-tight text-foreground min-[380px]:text-2xl sm:text-3xl">
            <span>{greeting}, <strong className="font-bold">{name}</strong></span>
            <AlumiaIcon icon={SparklesIcon} size="sm" className="hidden text-tone-sun-fg min-[360px]:inline-flex" />
          </h1>
        </div>
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/35 bg-card text-sm font-semibold text-foreground"
          role={avatarUrl ? undefined : "img"}
          aria-label={avatarUrl ? undefined : `Avatar de ${name}`}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={`Avatar de ${name}`} className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </div>
      </div>
      {role && (
        <div className="flex min-h-12 items-center gap-2 border-t border-border py-2.5 text-sm font-medium text-foreground sm:text-base">
          <span>{role}</span>
          <AlumiaIcon icon={SparklesIcon} size="xs" className="shrink-0 text-tone-sun-fg" />
        </div>
      )}
    </header>
  );
}
