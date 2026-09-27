import { getLocalDateString } from "./utils";
import type { StudentCommitment } from "@/types";

export const academicTypeLabels = {
  exam: "Prova",
  assignment: "Trabalho",
  reading: "Leitura",
  review: "Revisão",
} as const;

export function commitmentTimestamp(commitment: Pick<StudentCommitment, "date" | "time">) {
  if (!commitment.date) return Number.POSITIVE_INFINITY;
  const value = new Date(`${commitment.date}T${commitment.time || "23:59"}:00`).getTime();
  return Number.isNaN(value) ? Number.POSITIVE_INFINITY : value;
}

export function sortStudentCommitments(commitments: StudentCommitment[]) {
  return [...commitments].sort((first, second) => {
    if (Boolean(first.done) !== Boolean(second.done)) return first.done ? 1 : -1;
    return commitmentTimestamp(first) - commitmentTimestamp(second);
  });
}

export function getUpcomingCommitments(commitments: StudentCommitment[], limit = 3) {
  return sortStudentCommitments(commitments)
    .filter((commitment) => !commitment.done)
    .slice(0, limit);
}

export function formatFocusTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function getReviewDate(daysFromNow: number, now = new Date()) {
  const date = new Date(now);
  date.setDate(date.getDate() + daysFromNow);
  return getLocalDateString(date);
}

export function formatCommitmentDate(date?: string) {
  if (!date) return "Sem data";
  const today = getLocalDateString();
  if (date === today) return "Hoje";
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date === getLocalDateString(tomorrow)) return "Amanhã";
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}
