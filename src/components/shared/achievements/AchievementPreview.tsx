import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Award01Icon, ChevronRightIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { SectionHeader } from "@/components/ui/surface";
import { getAchievements } from "@/services/achievementService";
import type { Achievement } from "@/types/achievements";

export function AchievementPreview() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    getAchievements().then(setAchievements).catch(() => setAchievements([]));
  }, []);

  const earned = achievements.filter((item) => item.earned);
  const preview = (earned.length ? earned : achievements).slice(0, 5);

  return (
    <section>
      <SectionHeader
        icon={Award01Icon}
        iconClassName="text-primary"
        title="Conquistas"
        description="Lembranças de cuidado, nunca cobranças."
        action={(
          <Link to="/conquistas" className="inline-flex min-h-11 items-center gap-1 rounded-xl px-2 text-sm font-semibold text-primary hover:bg-primary/10">
            Ver todas <AlumiaIcon icon={ChevronRightIcon} size="xs" />
          </Link>
        )}
      />
      {preview.length > 0 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
          {preview.map((achievement) => (
            <Link key={achievement.id} to="/conquistas" className="w-24 shrink-0 text-center sm:w-28">
              <img src={achievement.imageUrl} alt="" aria-hidden="true" className="aspect-[2/3] w-full rounded-[1rem] border-2 border-primary/20 object-cover shadow-[var(--shadow-card)]" />
              <span className="mt-1.5 block text-xs font-semibold leading-tight">{achievement.title}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
