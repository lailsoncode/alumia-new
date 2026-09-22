import type { TaskPriority } from "../../../types";

interface PrioritySelectorProps {
  selectedPriority: TaskPriority;
  onChangePriority: (priority: TaskPriority) => void;
}

const priorityOptions: { label: string; value: TaskPriority }[] = [
  { label: "Baixa", value: "baixa" },
  { label: "Média", value: "media" },
  { label: "Alta", value: "alta" },
];

/**
 * PrioritySelector — Componente para seleção do nível de prioridade da tarefa.
 */
export function PrioritySelector({ selectedPriority, onChangePriority }: PrioritySelectorProps) {
  return (
    <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Prioridade da tarefa">
      {priorityOptions.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChangePriority(selectedPriority === opt.value ? null : opt.value)}
          aria-pressed={selectedPriority === opt.value}
          className={`min-h-11 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
            selectedPriority === opt.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-background text-foreground hover:bg-muted"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
