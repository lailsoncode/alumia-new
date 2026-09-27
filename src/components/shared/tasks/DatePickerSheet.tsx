import { useEffect, useState } from "react";
import { Cancel01Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { formatRecurrence, getIsoWeekday, getNextRecurrenceDate, WEEKDAYS } from "@/lib/tasks";
import { getLocalDateString } from "@/lib/utils";
import type { TaskRecurrenceDraft, TaskRecurrenceFrequency } from "@/types";
import { DatePickerCalendar } from "./DatePickerCalendar";

interface DatePickerSheetProps {
  open: boolean;
  onClose: () => void;
  onSave?: (date: Date | null, time: string | null, recurrence: TaskRecurrenceDraft | null) => void;
  initialDate?: Date | null;
  initialTime?: string | null;
  initialRecurrence?: TaskRecurrenceDraft | null;
  requireTime?: boolean;
}

export function DatePickerSheet({ open, onClose, onSave, initialDate, initialTime, initialRecurrence, requireTime = false }: DatePickerSheetProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date());
  const [time, setTime] = useState(initialTime || "");
  const [recurrence, setRecurrence] = useState<TaskRecurrenceDraft | null>(initialRecurrence ?? null);
  useEffect(() => {
    if (open) {
      setSelectedDate(initialDate || new Date());
      setTime(initialTime || "");
      setRecurrence(initialRecurrence ?? null);
    }
  }, [open, initialDate, initialTime, initialRecurrence]);
  if (!open) return null;

  const setFrequency = (frequency: TaskRecurrenceFrequency) => {
    setRecurrence({
      frequency,
      weekdays: frequency === "weekly"
        ? recurrence?.weekdays?.length ? recurrence.weekdays : [getIsoWeekday(selectedDate)]
        : undefined,
    });
  };

  const toggleWeekday = (weekday: number) => {
    const selected = recurrence?.weekdays ?? [];
    setRecurrence({
      frequency: "weekly",
      weekdays: selected.includes(weekday)
        ? selected.filter((day) => day !== weekday)
        : [...selected, weekday].sort((first, second) => first - second),
    });
  };

  const recurrenceIsValid = recurrence?.frequency !== "weekly" || Boolean(recurrence.weekdays?.length);
  const applySchedule = () => {
    let appliedDate = selectedDate;
    if (recurrence?.frequency === "weekly" && !recurrence.weekdays?.includes(getIsoWeekday(selectedDate))) {
      appliedDate = new Date(`${getNextRecurrenceDate(getLocalDateString(selectedDate), "weekly", recurrence.weekdays)}T00:00:00`);
    }
    onSave?.(appliedDate, time || null, recurrence);
    onClose();
  };
  return (
    <>
      <button type="button" className="fixed inset-0 z-[60] cursor-default bg-foreground/25 backdrop-blur-sm" onClick={onClose} aria-label="Fechar seleção de data" />
      <section role="dialog" aria-modal="true" aria-labelledby="date-title" className="alumia-elevated fixed inset-x-0 bottom-0 z-[70] max-h-[92svh] overflow-y-auto rounded-t-3xl p-4 sm:left-1/2 sm:bottom-5 sm:max-w-lg sm:-translate-x-1/2 sm:rounded-3xl sm:p-5">
        <div className="flex items-start justify-between gap-4"><div><h2 id="date-title" className="text-xl font-bold">Data e horário</h2><p className="mt-1 text-sm text-muted-foreground">Escolha quando este cuidado deve aparecer.</p></div><Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar"><AlumiaIcon icon={Cancel01Icon} size="sm" /></Button></div>
        <div className="mt-4"><DatePickerCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} /></div>
        <div className="mt-4 border-t border-border pt-4">
          <div className="flex min-h-11 items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Repetir tarefa?</p>
              <p className="text-xs text-muted-foreground">{formatRecurrence(recurrence)}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={Boolean(recurrence)}
              onClick={() => setRecurrence(recurrence ? null : { frequency: "daily" })}
              className={`relative h-7 w-12 rounded-full transition-colors ${recurrence ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${recurrence ? "left-6" : "left-1"}`} />
              <span className="sr-only">Repetir tarefa</span>
            </button>
          </div>
          {recurrence && (
            <div className="mt-3">
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Frequência da repetição">
                <Button type="button" size="sm" variant={recurrence.frequency === "daily" ? "default" : "outline"} onClick={() => setFrequency("daily")}>Todos os dias</Button>
                <Button type="button" size="sm" variant={recurrence.frequency === "weekly" ? "default" : "outline"} onClick={() => setFrequency("weekly")}>Dias da semana</Button>
              </div>
              {recurrence.frequency === "weekly" && (
                <div className="mt-2 grid grid-cols-7 gap-1" role="group" aria-label="Dias da recorrência">
                  {WEEKDAYS.map((weekday) => {
                    const selected = recurrence.weekdays?.includes(weekday.value);
                    return (
                      <button
                        key={weekday.value}
                        type="button"
                        aria-label={weekday.label}
                        aria-pressed={selected}
                        onClick={() => toggleWeekday(weekday.value)}
                        className={`flex h-10 items-center justify-center rounded-lg border text-xs font-semibold ${selected ? "border-primary bg-primary/10 text-primary" : "border-border bg-background"}`}
                      >
                        {weekday.short}
                      </button>
                    );
                  })}
                </div>
              )}
              {!recurrenceIsValid && <p className="mt-2 text-sm text-destructive">Escolha pelo menos um dia da semana.</p>}
            </div>
          )}
        </div>
        <label htmlFor="task-time" className="mt-4 block text-sm font-semibold">Horário <span className="font-normal text-muted-foreground">{requireTime ? "(obrigatório para o lembrete)" : "(opcional)"}</span></label>
        <div className="mt-2 flex min-h-12 items-center gap-2 rounded-xl border border-input bg-background px-4"><AlumiaIcon icon={Clock01Icon} size="sm" className="text-muted-foreground" /><input id="task-time" type="time" value={time} onChange={(event) => setTime(event.target.value)} className="min-h-11 flex-1 bg-transparent text-base focus:outline-none" /></div>
        <div className="mt-4 flex justify-end gap-2 border-t border-border pt-3"><Button variant="ghost" onClick={() => { onSave?.(null, null, null); onClose(); }}>Sem data</Button><Button disabled={(requireTime && !time) || !recurrenceIsValid} onClick={applySchedule}>Aplicar</Button></div>
      </section>
    </>
  );
}
