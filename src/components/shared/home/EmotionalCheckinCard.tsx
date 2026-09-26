import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { SmileIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { MODULE_THEMES } from "@/lib/module-themes";
import { MOOD_PRESENTATIONS } from "@/lib/checkin-moods";
import { isSameLocalDay } from "@/lib/utils";
import { getCareCheckinHistory } from "@/services/checkinService";
import type { CareCheckinHistoryItem } from "@/types";

export function EmotionalCheckinCard() {
  const navigate = useNavigate();
  const [todayCheckin, setTodayCheckin] = useState<CareCheckinHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCareCheckinHistory(0, 1)
      .then(([latest]) => setTodayCheckin(latest && isSameLocalDay(latest.occurredAt) ? latest : null))
      .catch(() => setTodayCheckin(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-20 animate-pulse rounded-[1.125rem] bg-muted" aria-label="Carregando check-in de hoje" />;
  }

  if (todayCheckin) {
    const mood = MOOD_PRESENTATIONS[todayCheckin.moodCategory];
    return (
      <button
        type="button"
        onClick={() => navigate({ to: "/check-in" })}
        className={`module-whisper grid w-full grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2.5 rounded-[1.125rem] border p-2.5 text-left shadow-none transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:grid-cols-[5rem_minmax(0,1fr)] ${MODULE_THEMES.checkin.themeClass}`}
        aria-label={`Abrir check-in de hoje: ${mood.label}`}
      >
        <img src={mood.image} alt="" className="aspect-square w-full rounded-lg object-cover" />
        <span className="min-w-0">
          <span className="block text-base font-semibold leading-snug sm:text-lg">{mood.label}</span>
          {todayCheckin.suggestion && (
            <span className="mt-0.5 block text-sm leading-snug text-foreground/75">
              {todayCheckin.suggestion.body}
            </span>
          )}
        </span>
      </button>
    );
  }

  return (
    <Surface className={`module-whisper flex items-center gap-2.5 p-2.5 shadow-none ${MODULE_THEMES.checkin.themeClass}`}>
      <AlumiaIcon icon={SmileIcon} size="md" className="module-text" />
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold sm:text-base">Como você está se sentindo hoje?</h2>
        <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">Um registro breve, só seu.</p>
      </div>
      <Button type="button" size="sm" className="shrink-0" onClick={() => navigate({ to: "/check-in" })}>
        Registrar
      </Button>
    </Surface>
  );
}
