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
    <div className="mt-3 flex gap-2">
      {priorityOptions.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChangePriority(selectedPriority === opt.value ? null : opt.value)}
          className={`rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors ${
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
