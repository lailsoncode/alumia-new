import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { DatePickerCalendar } from "./DatePickerCalendar";
import { DatePickerRecurrence } from "./DatePickerRecurrence";

interface DatePickerSheetProps {
  open: boolean;
  onClose: () => void;
  onSave?: (date: Date | null, time: string | null) => void;
  initialDate?: Date | null;
  initialTime?: string | null;
}

/**
 * DatePickerSheet — Bottom sheet para seleção de data, recorrência e horário de tarefas.
 * Orquestra os subcomponentes DatePickerCalendar e DatePickerRecurrence.
 */
export function DatePickerSheet({ open, onClose, onSave, initialDate, initialTime }: DatePickerSheetProps) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || today);
  const [recurring, setRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState<"diario" | "semanal">("semanal");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [time, setTime] = useState<string>(initialTime || "");
  const [showTimeInput, setShowTimeInput] = useState(!!initialTime);

  // Sincronizar valores iniciais ao abrir
  useEffect(() => {
    if (open) {
      setSelectedDate(initialDate || new Date());
      setTime(initialTime || "");
      setShowTimeInput(!!initialTime);
    }
  }, [open, initialDate, initialTime]);

  if (!open) return null;

  const toggleDay = (idx: number) => {
    setSelectedDays((prev) =>
      prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx],
    );
  };

  const handleSave = () => {
    onSave?.(selectedDate, time || null);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet dialog */}
      <div
        role="dialog"
        aria-label="Selecionar data e recorrência"
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-card px-5 pb-8 pt-5 shadow-2xl"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted-foreground/30" />

        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            {selectedDate.getDate()}/{selectedDate.getMonth() + 1}/{selectedDate.getFullYear()}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={18}
              strokeWidth={1.5}
              className="rotate-90"
            />
          </button>
        </div>

        {/* Recurrence Selector */}
        <DatePickerRecurrence
          recurring={recurring}
          onToggleRecurring={setRecurring}
          recurrence={recurrence}
          onChangeRecurrence={setRecurrence}
          selectedDays={selectedDays}
          onToggleDay={toggleDay}
          selectedDate={selectedDate}
        />

        <div className="my-2 h-px bg-border" />

        {/* Calendar Grid */}
        <DatePickerCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        {/* Time selector */}
        {showTimeInput ? (
          <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-4 py-2">
            <div className="flex items-center gap-2 flex-1">
              <HugeiconsIcon icon={Clock01Icon} size={15} strokeWidth={1.5} className="text-primary shrink-0" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-transparent text-sm text-foreground focus:outline-none cursor-pointer w-full"
              />
            </div>
            {time && (
              <button
                type="button"
                onClick={() => {
                  setTime("");
                  setShowTimeInput(false);
                }}
                className="text-xs text-destructive hover:underline font-semibold"
              >
                Limpar
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowTimeInput(true)}
            className="mt-4 flex w-full items-center gap-2 rounded-xl border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            <HugeiconsIcon icon={Clock01Icon} size={15} strokeWidth={1.5} />
            {time ? `Horário: ${time}` : "Adicionar horário"}
          </button>
        )}

        {/* Save button */}
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Salvar
            <HugeiconsIcon icon={ArrowRight01Icon} size={15} strokeWidth={2} />
          </button>
        </div>
      </div>
    </>
  );
}
