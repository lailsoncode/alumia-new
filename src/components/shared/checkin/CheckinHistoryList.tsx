import { Delete02Icon, HistoryIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { MOOD_PRESENTATIONS } from "@/lib/checkin-moods";
import type { CareCheckinHistoryItem } from "@/types";

interface CheckinHistoryListProps {
  items: CareCheckinHistoryItem[];
  onDelete?: (id: string) => void;
  deletingId?: string | null;
  compact?: boolean;
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function CheckinHistoryList({ items, onDelete, deletingId, compact = false }: CheckinHistoryListProps) {
  if (items.length === 0) {
    return (
      <Surface className="p-4 text-center shadow-none">
        <AlumiaIcon icon={HistoryIcon} size="md" className="module-text mx-auto" />
        <p className="mt-2 text-sm font-medium">Seus registros vão aparecer aqui, no seu tempo.</p>
      </Surface>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <Surface as="article" className="module-whisper rounded-[1.125rem] p-3 shadow-none">
            <div className="flex items-start gap-2.5">
              <img src={MOOD_PRESENTATIONS[item.moodCategory].image} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <h3 className="text-sm font-semibold sm:text-base">{MOOD_PRESENTATIONS[item.moodCategory].label}</h3>
                  <time className="text-xs text-muted-foreground" dateTime={item.occurredAt}>
                    {dateFormatter.format(new Date(item.occurredAt))}
                  </time>
                </div>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground sm:text-sm">
                  {item.emotions.map((emotion) => `${emotion.label} ${emotion.emoji}`).join(" · ")}
                </p>
                {item.need && <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{item.need.label}</p>}
                {!compact && item.suggestion && (
                  <p className="mt-2 text-sm leading-relaxed text-foreground/80">{item.suggestion.body}</p>
                )}
              </div>
              {onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 min-h-10 shrink-0 text-muted-foreground hover:text-destructive"
                  aria-label={`Excluir check-in de ${MOOD_PRESENTATIONS[item.moodCategory].label}`}
                  disabled={deletingId === item.id}
                  onClick={() => onDelete(item.id)}
                >
                  <AlumiaIcon icon={Delete02Icon} size="sm" />
                </Button>
              )}
            </div>
          </Surface>
        </li>
      ))}
    </ul>
  );
}
