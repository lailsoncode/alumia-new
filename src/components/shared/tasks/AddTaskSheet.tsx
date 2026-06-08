import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CalendarAdd01Icon,
  FlagIcon,
  AlarmClockIcon,
  GraduateMaleIcon,
  Cancel01Icon,
  ArrowRight01Icon,
  CameraMicrophone01Icon,
} from "@hugeicons/core-free-icons";
import type { TaskPriority, TaskReminder, AddTaskData } from "../../../types";
import { PrioritySelector } from "./PrioritySelector";
import { ReminderSelector } from "./ReminderSelector";
import { DatePickerSheet } from "./DatePickerSheet";

interface AddTaskSheetProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: AddTaskData) => void;
}

/**
 * AddTaskSheet — Bottom sheet para criação rápida de tarefas.
 */
export function AddTaskSheet({ open, onClose, onSave }: AddTaskSheetProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [activeChip, setActiveChip] = useState<"quando" | "prioridade" | "lembrete" | null>(null);
  const [priority, setPriority] = useState<TaskPriority>(null);
  const [reminder, setReminder] = useState<TaskReminder>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [dateSheetOpen, setDateSheetOpen] = useState(false);

  if (!open) return null;

  const handleSave = () => {
    onSave?.({
      title,
      description,
      priority,
      reminder,
      date: date ? date.toISOString().split("T")[0] : undefined,
      time: time || undefined,
    });
    setTitle("");
    setDescription("");
    setActiveChip(null);
    setPriority(null);
    setReminder(null);
    setDate(null);
    setTime(null);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-label="Adicionar tarefa"
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-card px-5 pb-8 pt-5 shadow-2xl"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted-foreground/30" />
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Nome da tarefa"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            className="min-w-0 flex-1 bg-transparent text-xl font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
          <button
            type="button"
            aria-label="Usar voz"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground"
          >
            <HugeiconsIcon icon={CameraMicrophone01Icon} size={18} strokeWidth={1.5} />
          </button>
        </div>
        <input
          type="text"
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1.5 w-full bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none"
        />
        <div className="my-3 h-px bg-border" />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setDateSheetOpen(true)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              date
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            <HugeiconsIcon icon={CalendarAdd01Icon} size={15} strokeWidth={1.5} />
            {date
              ? `${date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}${time ? ` às ${time}` : ""}`
              : "Quando?"}
          </button>
          <button
            type="button"
            onClick={() => setActiveChip(activeChip === "prioridade" ? null : "prioridade")}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              priority
                ? "border-primary bg-primary/10 text-primary"
                : activeChip === "prioridade"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            <HugeiconsIcon
              icon={FlagIcon}
              size={15}
              strokeWidth={1.5}
              className={
                priority === "alta"
                  ? "text-red-500 fill-red-500/10"
                  : priority === "media"
                    ? "text-yellow-500 fill-yellow-500/10"
                    : priority === "baixa"
                      ? "text-blue-500 fill-blue-500/10"
                      : ""
              }
            />
            {priority
              ? `Prioridade: ${priority === "alta" ? "Alta" : priority === "media" ? "Média" : "Baixa"}`
              : "Prioridade"}
          </button>
          <button
            type="button"
            onClick={() => setActiveChip(activeChip === "lembrete" ? null : "lembrete")}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              reminder
                ? "border-primary bg-primary/10 text-primary"
                : activeChip === "lembrete"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            <HugeiconsIcon icon={AlarmClockIcon} size={15} strokeWidth={1.5} />
            {reminder
              ? `Lembrete: ${
                  reminder === "na_hora"
                    ? "Na hora"
                    : reminder === "5min"
                      ? "5 min"
                      : reminder === "15min"
                        ? "15 min"
                        : "30 min"
                }`
              : "Lembrete"}
          </button>
          <button
            type="button"
            aria-label="Selecionar módulo"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted"
          >
            <HugeiconsIcon icon={GraduateMaleIcon} size={16} strokeWidth={1.5} />
          </button>
        </div>
        {activeChip === "prioridade" && (
          <PrioritySelector selectedPriority={priority} onChangePriority={setPriority} />
        )}
        {activeChip === "lembrete" && (
          <ReminderSelector selectedReminder={reminder} onChangeReminder={setReminder} />
        )}
        <div className="my-4 h-px bg-border" />
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={15}
              strokeWidth={1.5}
              className="text-destructive"
            />
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Salvar
            <HugeiconsIcon icon={ArrowRight01Icon} size={15} strokeWidth={2} />
          </button>
        </div>
      </div>

      <DatePickerSheet
        open={dateSheetOpen}
        onClose={() => setDateSheetOpen(false)}
        onSave={(selectedDate, selectedTime) => {
          setDate(selectedDate);
          setTime(selectedTime);
        }}
        initialDate={date}
        initialTime={time}
      />
    </>
  );
}
