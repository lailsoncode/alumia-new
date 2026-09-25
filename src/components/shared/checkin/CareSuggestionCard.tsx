import { ArrowReloadHorizontalIcon, Plant02Icon, TaskAdd01Icon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import type { CareSuggestion } from "@/types";

interface CareSuggestionCardProps {
  suggestion: CareSuggestion;
  onRestart: () => void;
  onAddTask: () => void;
}

export function CareSuggestionCard({ suggestion, onRestart, onAddTask }: CareSuggestionCardProps) {
  return (
    <div aria-live="polite">
      <div className="flex items-center gap-2">
        <AlumiaIcon icon={Plant02Icon} size="md" className="module-text" />
        <h2 className="text-lg font-semibold sm:text-xl">Uma sugestão para seu dia</h2>
      </div>
      <Surface className="module-whisper mt-2.5 p-3 shadow-none sm:p-4">
        <p className="text-sm leading-relaxed sm:text-base">{suggestion.actionText}</p>
      </Surface>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" className="min-w-0 px-2" onClick={onAddTask}>
          <AlumiaIcon icon={TaskAdd01Icon} size="xs" />
          <span className="truncate">Adicionar como tarefa</span>
        </Button>
        <Button type="button" variant="outline" className="min-w-0 px-2" onClick={onRestart}>
          <span>Refazer check-in</span>
          <AlumiaIcon icon={ArrowReloadHorizontalIcon} size="xs" />
        </Button>
      </div>
    </div>
  );
}
