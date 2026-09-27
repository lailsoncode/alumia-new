import { getLocalDateString } from "./utils";
import type { MindfulnessCategory, MindfulnessPractice, MindfulnessReminderChoice } from "@/types";

export const mindfulnessCategoryLabels: Record<MindfulnessCategory, string> = {
  breathing: "Respirar",
  grounding: "Acalmar",
  focus: "Concentrar",
  calm: "Acolher pensamentos",
  sleep: "Preparar para dormir",
};

export function formatMindfulnessTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function findClosestPractice(practices: MindfulnessPractice[], minutes: number) {
  return [...practices].sort((first, second) => {
    const distance = Math.abs(first.durationMinutes - minutes) - Math.abs(second.durationMinutes - minutes);
    return distance || first.sortOrder - second.sortOrder;
  })[0];
}

export function filterMindfulnessPractices(
  practices: MindfulnessPractice[],
  options: { search?: string; duration?: "short" | "medium"; format?: "audio" | "text"; category?: MindfulnessCategory },
) {
  const search = options.search?.trim().toLocaleLowerCase("pt-BR") ?? "";
  return practices.filter((practice) => {
    if (search && !`${practice.title} ${practice.description}`.toLocaleLowerCase("pt-BR").includes(search)) return false;
    if (options.duration === "short" && (practice.durationMinutes < 2 || practice.durationMinutes > 5)) return false;
    if (options.duration === "medium" && (practice.durationMinutes < 6 || practice.durationMinutes > 10)) return false;
    if (options.format && !practice.formats.includes(options.format)) return false;
    if (options.category && practice.category !== options.category) return false;
    return true;
  });
}

export function getMindfulnessReminderSchedule(choice: MindfulnessReminderChoice, now = new Date()) {
  const scheduledAt = new Date(now);
  if (choice === "later") scheduledAt.setHours(scheduledAt.getHours() + 2);
  else scheduledAt.setDate(scheduledAt.getDate() + 1);
  return {
    date: getLocalDateString(scheduledAt),
    time: `${String(scheduledAt.getHours()).padStart(2, "0")}:${String(scheduledAt.getMinutes()).padStart(2, "0")}`,
  };
}
