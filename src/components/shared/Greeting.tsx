import { useEffect, useState } from "react";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { useAuth } from "../../hooks/use-auth";
import { applyTheme, getStoredTheme } from "../../lib/theme";
import { getUserProfile } from "../../services/authService";

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
 * Exibe o nome do usuário, a saudação baseada no período do dia, e um avatar.
 */
export function Greeting({ name: propName, role, avatarUrl: propAvatarUrl }: GreetingProps) {
  const { user } = useAuth();
  const [name, setName] = useState(propName || "você");
  const [avatarUrl, setAvatarUrl] = useState(propAvatarUrl || "");
  const [greeting, setGreeting] = useState("Boa noite");
  const [profileLine, setProfileLine] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    const storedTheme = getStoredTheme();
    setGreeting(getPeriodGreeting(hour));
    applyTheme(storedTheme);
  }, []);

  useEffect(() => {
    if (propName) setName(propName);
    if (propAvatarUrl && !propAvatarUrl.startsWith("blob:")) {
      setAvatarUrl(propAvatarUrl);
    }

    if (user && !propName) {
      getUserProfile(user.id)
        .then((profile) => {
          if (profile) {
            setName(profile.firstName || user.email?.split("@")[0] || "você");
            setProfileLine(profile.bio?.split(/[.!?]/)[0]?.trim().slice(0, 64) || "");
            if (profile.avatarUrl && !propAvatarUrl) {
              if (!profile.avatarUrl.startsWith("blob:")) {
                setAvatarUrl(profile.avatarUrl);
              }
            }
          } else {
            setName(user.email?.split("@")[0] || "você");
          }
        })
        .catch((err) => {
          console.error("Erro ao carregar perfil no Greeting:", err);
          setName(user.email?.split("@")[0] || "você");
        });
    } else if (!user && !propName) {
      setName("você");
    }
  }, [user, propName, propAvatarUrl]);

  const subtitleByPeriod = () => {
    if (greeting === "Bom dia") return "Que o seu dia seja incrível!";
    if (greeting === "Boa tarde") return "Hoje o sol nasceu só para você brilhar!";
    return "Descanse bem, amanhã é um novo dia!";
  };

  const initials = (name || "V")
    .split(" ")
    .filter(Boolean)
    .map((p) => [...p][0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const personalLine = profileLine || subtitleByPeriod();

  return (
    <header className="-mx-4 -mt-4 border-b border-border bg-surface px-4 pt-3 sm:-mx-5 sm:-mt-5 sm:px-5 lg:-mx-6 lg:-mt-6 lg:px-6">
      <div className="flex items-center justify-between gap-3 pb-3">
        <div className="min-w-0 flex-1">
          <h1 className="flex flex-wrap items-center gap-x-2 font-display text-xl font-semibold tracking-tight text-foreground min-[380px]:text-2xl sm:text-3xl">
            <span>{greeting}, <strong className="font-bold">{name}</strong></span>
            <AlumiaIcon icon={SparklesIcon} size="sm" className="hidden text-tone-sun-fg min-[360px]:inline-flex" />
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{personalLine}</p>
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
