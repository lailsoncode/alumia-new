import { CalendarHeartIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { MOOD_PRESENTATIONS } from "@/lib/checkin-moods";
import type { CareCheckinHistoryItem } from "@/types";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

export function MoodCalendar({ items }: { items: CareCheckinHistoryItem[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="mood-calendar-title">
      <div className="flex items-center gap-2">
        <AlumiaIcon icon={CalendarHeartIcon} size="md" className="module-text" />
        <h2 id="mood-calendar-title" className="text-lg font-semibold sm:text-xl">Meu calendário de emoções</h2>
      </div>
      <div className="mt-2.5 grid grid-cols-5 gap-1.5 sm:gap-2">
        {items.map((item) => {
          const mood = MOOD_PRESENTATIONS[item.moodCategory];
          return (
            <article key={item.id} className="module-whisper min-w-0 rounded-xl border p-1 shadow-none">
              <img src={mood.image} alt="" className="aspect-square w-full rounded-lg object-cover" />
              <time
                dateTime={item.occurredAt}
                className="mt-1 block truncate text-center text-[0.7rem] font-medium text-muted-foreground sm:text-xs"
                aria-label={`${mood.label}, ${new Date(item.occurredAt).toLocaleDateString("pt-BR")}`}
              >
                {dateFormatter.format(new Date(item.occurredAt))}
              </time>
            </article>
          );
        })}
      </div>
    </section>
  );
}
