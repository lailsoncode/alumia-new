import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/use-auth";
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
  const [name, setName] = useState(propName || "😊");
  const [avatarUrl, setAvatarUrl] = useState(propAvatarUrl || "");
  const [greeting, setGreeting] = useState("Boa noite");

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(getPeriodGreeting(hour));
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
            setName(profile.firstName || user.email?.split("@")[0] || "😊");
            if (profile.avatarUrl && !propAvatarUrl) {
              if (!profile.avatarUrl.startsWith("blob:")) {
                setAvatarUrl(profile.avatarUrl);
              }
            }
          } else {
            setName(user.email?.split("@")[0] || "😊");
          }
        })
        .catch((err) => {
          console.error("Erro ao carregar perfil no Greeting:", err);
          setName(user.email?.split("@")[0] || "😊");
        });
    } else if (!user && !propName) {
      setName("😊");
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
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="flex items-start justify-between gap-3 px-1 py-1">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
          {greeting}, <span className="font-bold">{name}</span>
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{role ?? subtitleByPeriod()}</p>
      </div>
      <div className="shrink-0">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/60 bg-card text-sm font-semibold text-foreground overflow-hidden"
          aria-label={`Avatar de ${name}`}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>
      </div>
    </header>
  );
}
