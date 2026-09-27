import { describe, expect, it } from "vitest";
import { filterMindfulnessPractices, findClosestPractice, formatMindfulnessTime, getMindfulnessReminderSchedule } from "./mindfulness";
import type { MindfulnessPractice } from "@/types";

const practices: MindfulnessPractice[] = [
  { id: "1", code: "ground", version: 1, title: "Aterrissar", description: "Perceber o presente", durationMinutes: 3, category: "grounding", formats: ["audio", "text"], instructions: ["Pare."], sortOrder: 10 },
  { id: "2", code: "thoughts", version: 1, title: "Acolher pensamentos", description: "Notar pensamentos", durationMinutes: 7, category: "calm", formats: ["text"], instructions: ["Note."], sortOrder: 20 },
];

describe("mindfulness domain", () => {
  it("formata o contador e limita valores negativos", () => {
    expect(formatMindfulnessTime(134)).toBe("02:14");
    expect(formatMindfulnessTime(-1)).toBe("00:00");
  });

  it("encontra a prática mais próxima da duração escolhida", () => {
    expect(findClosestPractice(practices, 5)?.id).toBe("1");
  });

  it("combina busca, duração e formato", () => {
    expect(filterMindfulnessPractices(practices, { search: "pensamentos", duration: "medium", format: "text" })).toEqual([practices[1]]);
    expect(filterMindfulnessPractices(practices, { format: "audio" })).toEqual([practices[0]]);
  });

  it("move o lembrete de mais tarde para o dia seguinte quando necessário", () => {
    expect(getMindfulnessReminderSchedule("later", new Date(2026, 8, 27, 23, 15))).toEqual({ date: "2026-09-28", time: "01:15" });
  });
});
