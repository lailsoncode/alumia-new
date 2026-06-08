import type { TaskReminder } from "../../../types";

interface ReminderSelectorProps {
  selectedReminder: TaskReminder;
  onChangeReminder: (reminder: TaskReminder) => void;
}

const reminderOptions: { label: string; value: TaskReminder }[] = [
  { label: "Na hora", value: "na_hora" },
  { label: "5 min", value: "5min" },
  { label: "15 min", value: "15min" },
  { label: "30 min", value: "30min" },
];

/**
 * ReminderSelector — Componente para seleção do momento do lembrete da tarefa.
 */
export function ReminderSelector({ selectedReminder, onChangeReminder }: ReminderSelectorProps) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {reminderOptions.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChangeReminder(selectedReminder === opt.value ? null : opt.value)}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
            selectedReminder === opt.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-background text-foreground hover:bg-muted"
          }`}
        >
          {opt.label}
        </button>
      ))}

      {/* PRO badge */}
      <button
        type="button"
        disabled
        className="flex items-center gap-1 rounded-lg border border-tone-sun-fg/30 bg-tone-sun px-3 py-1.5 text-sm font-medium text-tone-sun-fg opacity-80"
      >
        ⭐ PRO
      </button>
    </div>
  );
}
