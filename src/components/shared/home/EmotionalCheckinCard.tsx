import { useNavigate } from "@tanstack/react-router";
import { SmileIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { MODULE_THEMES } from "@/lib/module-themes";

export function EmotionalCheckinCard() {
  const navigate = useNavigate();
  return (
    <Surface className={`module-whisper flex items-center gap-3 rounded-[1.25rem] p-3 shadow-none ${MODULE_THEMES.checkin.themeClass}`}>
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
