import { SunCloud01Icon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Surface } from "@/components/ui/surface";
import { MOOD_PRESENTATIONS } from "@/lib/checkin-moods";
import type { CreateCareCheckinResult } from "@/types";

export function MoodSummaryCard({ result }: { result: CreateCareCheckinResult }) {
  const mood = MOOD_PRESENTATIONS[result.moodCategory];
  return (
    <Surface className="module-surface grid grid-cols-[4.75rem_minmax(0,1fr)] items-center gap-2.5 p-2.5 shadow-none sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:p-3">
      <img
        src={mood.image}
        alt={`Ilustração que representa ${mood.label.toLowerCase()}`}
        className="aspect-square w-full rounded-lg object-cover"
      />
      <div className="min-w-0">
        <div className="flex items-start gap-2">
          <AlumiaIcon icon={SunCloud01Icon} size="md" className="module-text mt-0.5" />
          <h2 className="text-lg font-semibold leading-snug sm:text-xl">{mood.label}</h2>
        </div>
        <p className="mt-0.5 text-sm font-medium leading-snug sm:text-base">{result.suggestion.title}</p>
        <p className="mt-0.5 text-xs leading-snug text-foreground/75 sm:text-sm">{result.suggestion.body}</p>
      </div>
    </Surface>
  );
}
