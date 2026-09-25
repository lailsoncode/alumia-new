import { useState } from "react";
import { AlarmClockIcon, ArrowRight01Icon, CalendarAdd01Icon, Cancel01Icon, FlagIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import type { AddTaskData, TaskPriority, TaskReminder } from "@/types";
import { DatePickerSheet } from "./DatePickerSheet";
import { PrioritySelector } from "./PrioritySelector";
import { ReminderSelector } from "./ReminderSelector";

interface AddTaskSheetProps { open: boolean; onClose: () => void; onSave?: (data: AddTaskData) => void | Promise<void>; }

export function AddTaskSheet({ open, onClose, onSave }: AddTaskSheetProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState<"prioridade" | "lembrete" | null>(null);
  const [priority, setPriority] = useState<TaskPriority>(null);
  const [reminder, setReminder] = useState<TaskReminder>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [openReminderAfterDate, setOpenReminderAfterDate] = useState(false);
  if (!open) return null;

  const dateLabel = date
    ? `${date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}${time ? `, ${time}` : ""}`
    : "Quando?";
  const priorityLabel = priority ? priority[0].toUpperCase() + priority.slice(1) : "Prioridade";
  const reminderLabel = reminder === "na_hora" ? "Na hora" : reminder?.replace("min", " min") || "Lembrete";

  const openReminder = () => {
    if (!date || !time) {
      setActive(null);
      setOpenReminderAfterDate(true);
      setDateOpen(true);
      return;
    }
    setActive(active === "lembrete" ? null : "lembrete");
  };

  const save = async () => {
    const dateValue = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` : undefined;
    await onSave?.({ title: title.trim(), description: description.trim(), priority, reminder, date: dateValue, time: time || undefined });
    setTitle(""); setDescription(""); setPriority(null); setReminder(null); setDate(null); setTime(null); setActive(null); onClose();
  };

  return (
    <>
      <button type="button" className="fixed inset-0 z-40 cursor-default bg-foreground/25 backdrop-blur-sm" onClick={onClose} aria-label="Fechar criação de tarefa" />
      <section role="dialog" aria-modal="true" aria-labelledby="add-task-title" className="alumia-elevated fixed inset-x-0 bottom-0 z-50 max-h-[92svh] overflow-y-auto rounded-t-3xl p-3 sm:left-1/2 sm:bottom-5 sm:max-w-2xl sm:-translate-x-1/2 sm:rounded-3xl sm:p-4">
        <div className="mx-auto mb-2 h-1 w-12 rounded-full bg-muted-foreground/30 sm:hidden" />
        <div className="flex items-center justify-between gap-2">
          <h2 id="add-task-title" className="text-lg font-bold">Adicionar tarefa</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar"><AlumiaIcon icon={Cancel01Icon} size="sm" /></Button>
        </div>

        <div className="mt-2 space-y-2">
          <div><label htmlFor="task-title" className="text-sm font-semibold">Título</label><input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} autoFocus className="mt-1 min-h-11 w-full rounded-xl border border-input bg-background px-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30" /></div>
          <div><label htmlFor="task-description" className="text-sm font-semibold">Descrição <span className="font-normal text-muted-foreground">(opcional)</span></label><textarea id="task-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={1} className="mt-1 min-h-11 w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30" /></div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <Button variant="outline" size="sm" className="min-w-0 gap-1 px-2 sm:gap-2 sm:px-3.5" onClick={() => { setOpenReminderAfterDate(false); setDateOpen(true); }} aria-label={date ? `Agendamento: ${dateLabel}` : "Definir data e horário"}><AlumiaIcon icon={CalendarAdd01Icon} size="xs" /><span className="min-w-0 truncate">{dateLabel}</span></Button>
          <Button variant="outline" size="sm" className="min-w-0 gap-1 px-2 sm:gap-2 sm:px-3.5" onClick={() => setActive(active === "prioridade" ? null : "prioridade")} aria-label={priority ? `Prioridade ${priority}` : "Definir prioridade"}><AlumiaIcon icon={FlagIcon} size="xs" /><span className="min-w-0 truncate">{priorityLabel}</span></Button>
          <Button variant="outline" size="sm" className="min-w-0 gap-1 px-2 sm:gap-2 sm:px-3.5" onClick={openReminder} aria-label={reminder ? `Lembrete ${reminderLabel}` : "Definir lembrete"}><AlumiaIcon icon={AlarmClockIcon} size="xs" /><span className="min-w-0 truncate">{reminderLabel}</span></Button>
        </div>
        {active === "prioridade" && <PrioritySelector selectedPriority={priority} onChangePriority={setPriority} />}
        {active === "lembrete" && <ReminderSelector selectedReminder={reminder} onChangeReminder={setReminder} />}

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="button" onClick={save} disabled={!title.trim()}>Salvar tarefa<AlumiaIcon icon={ArrowRight01Icon} size="xs" /></Button>
        </div>
      </section>
      <DatePickerSheet
        open={dateOpen}
        onClose={() => { setDateOpen(false); setOpenReminderAfterDate(false); }}
        onSave={(selectedDate, selectedTime) => {
          setDate(selectedDate);
          setTime(selectedTime);
          if (openReminderAfterDate && selectedDate && selectedTime) setActive("lembrete");
          setOpenReminderAfterDate(false);
        }}
        initialDate={date}
        initialTime={time}
        requireTime={openReminderAfterDate || Boolean(reminder)}
      />
    </>
  );
}
