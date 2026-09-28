import { useEffect, useState } from "react";
import { Award01Icon, LockIcon } from "@hugeicons/core-free-icons";
import { AchievementDialog } from "./AchievementDialog";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { InlineFeedback, SectionHeader, Surface } from "@/components/ui/surface";
import { getAchievements } from "@/services/achievementService";
import type { Achievement } from "@/types/achievements";

export function AchievementCollection() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selected, setSelected] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getAchievements()
      .then(setAchievements)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const earnedCount = achievements.filter((item) => item.earned).length;

  return (
    <section>
      <SectionHeader
        icon={Award01Icon}
        iconClassName="text-primary"
        title="Insígnias da jornada"
        description={loading ? "Reunindo seus gestos de cuidado…" : `${earnedCount} ${earnedCount === 1 ? "conquista acolhida" : "conquistas acolhidas"}. As outras esperam sem pressa.`}
      />

      {error && (
        <InlineFeedback tone="danger">
          Não conseguimos carregar sua coleção agora. <button type="button" onClick={load} className="font-semibold underline">Tentar novamente</button>
        </InlineFeedback>
      )}

      {loading ? (
        <div className="mt-4 grid grid-cols-2 gap-3 min-[480px]:grid-cols-3 md:grid-cols-4 xl:grid-cols-5" aria-label="Carregando conquistas">
          {Array.from({ length: 10 }).map((_, index) => <div key={index} className="aspect-[2/3] animate-pulse rounded-[1.5rem] bg-muted" />)}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 min-[480px]:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {achievements.map((achievement) => (
            <button key={achievement.id} type="button" onClick={() => setSelected(achievement)} className="group text-left">
              <Surface as="article" variant="interactive" className="relative overflow-hidden p-2.5">
                <div className="relative overflow-hidden rounded-[1.125rem] bg-muted">
                  <img
                    src={achievement.imageUrl}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className={`aspect-[2/3] w-full object-cover transition duration-300 group-hover:scale-[1.02] ${achievement.earned ? "" : "grayscale opacity-55"}`}
                  />
                  <span className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border shadow-sm ${achievement.earned ? "border-primary/25 bg-surface/90 text-primary" : "border-border bg-surface/90 text-muted-foreground"}`}>
                    <AlumiaIcon icon={achievement.earned ? Award01Icon : LockIcon} size="xs" />
                  </span>
                </div>
                <h3 className="mt-2 min-h-10 text-center text-sm font-semibold leading-tight">{achievement.title}</h3>
                <p className="mt-1 text-center text-[0.68rem] font-semibold uppercase tracking-wide text-muted-foreground">
                  {achievement.earned ? "Acolhida" : "Sem pressa"}
                </p>
              </Surface>
            </button>
          ))}
        </div>
      )}

      <AchievementDialog achievement={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} />
    </section>
  );
}
