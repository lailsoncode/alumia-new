import { SunCloud01Icon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MOOD_PRESENTATIONS } from "@/lib/checkin-moods";
import type { CareCheckinHistoryItem } from "@/types";

const fullDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

interface CheckinDetailDialogProps {
  item: CareCheckinHistoryItem | null;
  onOpenChange: (open: boolean) => void;
}

export function CheckinDetailDialog({ item, onOpenChange }: CheckinDetailDialogProps) {
  if (!item) return null;
  const mood = MOOD_PRESENTATIONS[item.moodCategory];

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="module-theme-checkin w-[calc(100%-2rem)] max-w-md gap-3 rounded-[1.25rem] border-[var(--module-border)] p-4 pt-5 sm:p-6">
        <img
          src={mood.image}
          alt={`Ilustração que representa ${mood.label.toLowerCase()}`}
          className="mx-auto aspect-square w-28 rounded-xl border border-[var(--module-border)] object-cover sm:w-32"
        />
        <DialogHeader className="space-y-2 text-center sm:text-center">
          <time dateTime={item.occurredAt} className="text-xs font-semibold text-muted-foreground sm:text-sm">
            {fullDateFormatter.format(new Date(item.occurredAt))}
          </time>
          <DialogTitle className="flex items-center justify-center gap-2 text-xl sm:text-2xl">
            <AlumiaIcon icon={SunCloud01Icon} size="md" className="module-text" />
            {mood.label}
          </DialogTitle>
          {item.suggestion && (
            <DialogDescription asChild>
              <div className="space-y-2 text-center text-foreground">
                <p className="font-semibold leading-relaxed">{item.suggestion.title}</p>
                <p className="text-sm leading-relaxed text-foreground/75 sm:text-base">{item.suggestion.body}</p>
              </div>
            </DialogDescription>
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
