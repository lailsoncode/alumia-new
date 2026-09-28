import { Award01Icon, LockIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Achievement } from "@/types/achievements";

interface AchievementDialogProps {
  achievement: Achievement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  celebration?: boolean;
}

export function AchievementDialog({ achievement, open, onOpenChange, celebration = false }: AchievementDialogProps) {
  if (!achievement) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-[1.5rem] border-primary/25 bg-surface p-0">
        <div className="grid gap-0 sm:grid-cols-[12rem_1fr]">
          <div className="bg-tone-sky p-4 sm:p-5">
            <img
              src={achievement.imageUrl}
              alt={`Arte da conquista ${achievement.title}`}
              className={`mx-auto aspect-[2/3] w-full max-w-36 rounded-[1.25rem] object-cover shadow-[var(--shadow-elevated)] sm:max-w-40 ${achievement.earned ? "" : "grayscale opacity-65"}`}
            />
          </div>
          <div className="flex flex-col p-5 sm:p-6">
            <DialogHeader className="pr-7 text-left">
              <span className="flex items-center gap-2 text-sm font-semibold text-primary">
                <AlumiaIcon icon={achievement.earned ? Award01Icon : LockIcon} size="sm" />
                {celebration ? "Uma conquista floresceu" : achievement.earned ? "Conquista acolhida" : "Ainda por florescer"}
              </span>
              <DialogTitle className="pt-1 font-display text-2xl leading-tight">{achievement.title}</DialogTitle>
              <DialogDescription className="pt-2 text-sm leading-relaxed text-foreground">
                {achievement.earned ? achievement.description : achievement.invitation}
              </DialogDescription>
            </DialogHeader>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              {achievement.earnedAt
                ? `Guardada em ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(achievement.earnedAt))}.`
                : "Sem prazo, sem perda de progresso e sem obrigação."}
            </p>
            <DialogFooter className="mt-auto pt-5 sm:justify-start">
              {achievement.earned && (
                <Button asChild variant="outline" size="sm">
                  <a href={achievement.wallpaperUrl} target="_blank" rel="noreferrer">Abrir arte em alta resolução</a>
                </Button>
              )}
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
