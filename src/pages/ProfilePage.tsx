import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Award01Icon,
  BookOpenCheckIcon,
  CalendarHeartIcon,
  CheckListIcon,
  ChevronRightIcon,
  GlassWaterIcon,
  SmileIcon,
  SparklesIcon,
  UserIcon,
  Yoga01Icon,
} from "@hugeicons/core-free-icons";
import { AchievementPreview } from "@/components/shared/achievements";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { InlineFeedback, SectionHeader, Surface } from "@/components/ui/surface";
import { useAuth } from "@/hooks/use-auth";
import { ALUMIA_AVATAR_IMAGES } from "@/lib/alumia-avatar";
import { getJourneySummary, type JourneySummary } from "@/services/profileService";

const summaryItems = [
  { key: "completedTasks", label: "tarefas acolhidas", icon: CheckListIcon },
  { key: "checkins", label: "check-ins feitos", icon: SmileIcon },
  { key: "hydrationDays", label: "dias com água registrada", icon: GlassWaterIcon },
  { key: "mindfulnessSessions", label: "pausas vividas", icon: Yoga01Icon },
  { key: "studySessions", label: "sessões de estudo", icon: BookOpenCheckIcon },
  { key: "earnedAchievements", label: "conquistas guardadas", icon: Award01Icon },
] as const;

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [summary, setSummary] = useState<JourneySummary | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getJourneySummary().then(setSummary).catch(() => setError(true));
  }, []);

  const name = profile?.firstName
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : user?.email?.split("@")[0] || "Seu perfil";
  const initials = name.split(" ").filter(Boolean).map((part) => [...part][0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-4">
      <Surface className="overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-tone-sky via-tone-lavender to-tone-peach sm:h-24" />
        <div className="px-4 pb-4 sm:px-5 sm:pb-5">
          <div className="-mt-10 flex items-end justify-between gap-3 sm:-mt-12">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[1.5rem] border-4 border-surface bg-primary/10 text-xl font-bold text-primary shadow-[var(--shadow-card)] sm:h-24 sm:w-24">
              {profile?.avatarUrl ? <img src={profile.avatarUrl} alt={`Foto de ${name}`} className="h-full w-full object-cover" /> : initials}
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/completar-perfil" })}>
              <AlumiaIcon icon={UserIcon} size="xs" />Editar perfil
            </Button>
          </div>
          <h2 className="mt-3 text-xl font-semibold sm:text-2xl">{name}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{user?.email}</p>
          {profile?.bio && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground">{profile.bio}</p>}
          {profile?.goals && (
            <div className="mt-3 flex max-w-2xl items-start gap-2 rounded-xl bg-surface-subtle p-3">
              <AlumiaIcon icon={SparklesIcon} size="sm" className="mt-0.5 shrink-0 text-primary" />
              <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">O que quero cuidar agora</p><p className="mt-1 text-sm leading-relaxed">{profile.goals}</p></div>
            </div>
          )}
        </div>
      </Surface>

      <Surface className="overflow-hidden border-primary/20 bg-primary/10">
        <div className="grid min-h-40 grid-cols-[7.5rem_1fr] items-center sm:grid-cols-[10rem_1fr]">
          <img src={ALUMIA_AVATAR_IMAGES.companion} alt="Alumia sorrindo e segurando um caderno" className="h-full w-full object-cover object-[52%_35%]" />
          <div className="p-4 sm:p-5">
            <p className="font-display text-base font-semibold sm:text-lg">A Alumia segue por aqui.</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Sua história não precisa virar desempenho. Este perfil guarda os gestos de cuidado que fizeram sentido para você.</p>
          </div>
        </div>
      </Surface>

      <section>
        <SectionHeader
          icon={CalendarHeartIcon}
          iconClassName="text-primary"
          title="Sua jornada"
          description={summary ? `Com a Alumia desde ${new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(summary.memberSince))}.` : "Reunindo sua história com carinho…"}
        />
        {error && <div className="mt-3"><InlineFeedback tone="danger">Não conseguimos reunir sua jornada agora.</InlineFeedback></div>}
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {summaryItems.map((item) => (
            <Surface key={item.key} variant="subtle" className="flex min-h-28 flex-col justify-between p-3 shadow-none">
              <AlumiaIcon icon={item.icon} size="md" className="text-primary" />
              <div className="mt-3"><p className="font-display text-2xl font-bold">{summary ? summary[item.key] : "—"}</p><p className="text-xs leading-snug text-muted-foreground">{item.label}</p></div>
            </Surface>
          ))}
        </div>
      </section>

      <AchievementPreview />

      <section>
        <SectionHeader icon={UserIcon} iconClassName="text-tone-peach-fg" title="Seu espaço" />
        <Surface className="mt-2.5 divide-y divide-border overflow-hidden">
          <button type="button" onClick={() => navigate({ to: "/conquistas" })} className="flex min-h-14 w-full items-center gap-3 px-3 text-left hover:bg-muted sm:px-4">
            <AlumiaIcon icon={Award01Icon} size="sm" className="text-primary" /><span className="flex-1 text-sm font-semibold">Ver todas as conquistas</span><AlumiaIcon icon={ChevronRightIcon} size="sm" className="text-muted-foreground" />
          </button>
          <button type="button" onClick={() => navigate({ to: "/ajustes" })} className="flex min-h-14 w-full items-center gap-3 px-3 text-left hover:bg-muted sm:px-4">
            <AlumiaIcon icon={UserIcon} size="sm" className="text-primary" /><span className="flex-1 text-sm font-semibold">Preferências e privacidade</span><AlumiaIcon icon={ChevronRightIcon} size="sm" className="text-muted-foreground" />
          </button>
        </Surface>
      </section>
    </div>
  );
}
