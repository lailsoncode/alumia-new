import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { RepeatIcon, Calendar01Icon } from "@hugeicons/core-free-icons";

const DAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"] as const;

interface DatePickerRecurrenceProps {
  recurring: boolean;
  onToggleRecurring: (recurring: boolean) => void;
  recurrence: "diario" | "semanal";
  onChangeRecurrence: (type: "diario" | "semanal") => void;
  selectedDays: number[];
  onToggleDay: (dayIndex: number) => void;
  selectedDate: Date;
}

/**
 * DatePickerRecurrence — Componente para configuração de repetição e recorrência de tarefas.
 */
export function DatePickerRecurrence({
  recurring,
  onToggleRecurring,
  recurrence,
  onChangeRecurrence,
  selectedDays,
  onToggleDay,
  selectedDate,
}: DatePickerRecurrenceProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="w-full">
      {/* Repeat toggle */}
      <div className="mb-3 flex items-center gap-3">
        <HugeiconsIcon
          icon={RepeatIcon}
          size={16}
          strokeWidth={1.5}
          className="text-muted-foreground"
        />
        <span className="flex-1 text-sm text-foreground">Repetir tarefa?</span>
        <button
          type="button"
          role="switch"
          aria-checked={recurring}
          onClick={() => onToggleRecurring(!recurring)}
          className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors ${
            recurring
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/40"
          }`}
        >
          {recurring && <span className="text-xs font-bold">✓</span>}
        </button>
      </div>

      {recurring && (
        <div className="space-y-3">
          {/* Start date row */}
          <div className="flex items-center gap-2 text-sm text-foreground">
            <HugeiconsIcon
              icon={Calendar01Icon}
              size={15}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
            <span className="text-muted-foreground">Início:</span>
            <span>
              {selectedDate.getDate()}/{selectedDate.getMonth() + 1}/{selectedDate.getFullYear()}
            </span>
          </div>

          {/* Recurrence row */}
          <div className="relative flex items-center gap-2 text-sm text-foreground">
            <HugeiconsIcon
              icon={RepeatIcon}
              size={15}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
            <span className="text-muted-foreground">Recorrência:</span>
            <button
              type="button"
              onClick={() => setShowDropdown((v) => !v)}
              className="flex items-center gap-1 font-medium text-foreground"
            >
              {recurrence === "diario" ? "Diário" : "Semanal"}
              <span className="text-xs text-muted-foreground">▾</span>
            </button>
            {showDropdown && (
              <div className="absolute left-20 top-6 z-10 rounded-xl border border-border bg-card shadow-lg">
                {(["diario", "semanal"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      onChangeRecurrence(r);
                      setShowDropdown(false);
                    }}
                    className="block w-full px-5 py-2.5 text-left text-sm font-medium text-foreground hover:bg-muted first:rounded-t-xl last:rounded-b-xl"
                  >
                    {r === "diario" ? "Diário" : "Semanal"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Days of week */}
          {recurrence === "semanal" && (
            <div className="flex gap-1.5">
              {DAYS.map((day, idx) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => onToggleDay(idx)}
                  className={`flex h-8 flex-1 items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                    selectedDays.includes(idx)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
