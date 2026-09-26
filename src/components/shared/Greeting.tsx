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
    <header className="-mx-4 -mt-3 border-b border-border/70 bg-surface px-4 pt-2.5 sm:-mx-5 sm:-mt-4 sm:px-5 lg:-mx-6 lg:-mt-5 lg:px-6">
      <div className="flex items-center justify-between gap-3 pb-2.5">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-semibold tracking-tight text-foreground min-[380px]:text-[1.4rem] sm:text-2xl">
            <span>{greeting}, <strong className="font-bold">{name}</strong></span>
          </h1>
          {role && <p className="mt-0.5 text-sm font-medium leading-snug text-foreground sm:text-base">{role}</p>}
        </div>
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/35 bg-card text-lg font-semibold text-foreground"
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
    </header>
  );
}
