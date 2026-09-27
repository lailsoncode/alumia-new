import { describe, expect, it } from "vitest";
import { getNextRecurrenceDate } from "./tasks";

describe("recorrência de tarefas", () => {
  it("avança uma recorrência diária inclusive na mudança de mês", () => {
    expect(getNextRecurrenceDate("2026-09-30", "daily")).toBe("2026-10-01");
  });

  it("encontra o próximo entre vários dias semanais", () => {
    expect(getNextRecurrenceDate("2026-09-29", "weekly", [2, 4])).toBe("2026-10-01");
    expect(getNextRecurrenceDate("2026-10-01", "weekly", [2, 4])).toBe("2026-10-06");
  });

  it("rejeita recorrência semanal sem nenhum dia", () => {
    expect(() => getNextRecurrenceDate("2026-09-29", "weekly", [])).toThrow("ao menos um dia");
  });
});
