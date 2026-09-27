import { getLocalDateString } from "./utils";
import type { TaskRecurrenceDraft, TaskRecurrenceFrequency } from "@/types";

export const WEEKDAYS = [
  { value: 1, short: "S", label: "segunda" },
  { value: 2, short: "T", label: "terça" },
  { value: 3, short: "Q", label: "quarta" },
  { value: 4, short: "Q", label: "quinta" },
  { value: 5, short: "S", label: "sexta" },
  { value: 6, short: "S", label: "sábado" },
  { value: 7, short: "D", label: "domingo" },
] as const;

export function getIsoWeekday(date: Date) {
  return date.getDay() === 0 ? 7 : date.getDay();
}

export function getNextRecurrenceDate(
  from: string,
  frequency: TaskRecurrenceFrequency,
  weekdays: number[] = [],
) {
  if (frequency === "weekly" && weekdays.length === 0) {
    throw new Error("A recorrência semanal precisa de ao menos um dia.");
  }
  const [year, month, day] = from.split("-").map(Number);
  const candidate = new Date(year, month - 1, day);
  const allowedDays = new Set(weekdays);
  do {
    candidate.setDate(candidate.getDate() + 1);
  } while (frequency === "weekly" && !allowedDays.has(getIsoWeekday(candidate)));
  return getLocalDateString(candidate);
}

export function formatRecurrence(recurrence?: TaskRecurrenceDraft | null) {
  if (!recurrence) return "Não repetir";
  if (recurrence.frequency === "daily") return "Todos os dias";
  const labels = WEEKDAYS
    .filter((day) => recurrence.weekdays?.includes(day.value))
    .map((day) => day.label.slice(0, 3));
  return labels.length ? `Semanal: ${labels.join(", ")}` : "Toda semana";
}
