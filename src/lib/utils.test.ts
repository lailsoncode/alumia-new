import { describe, expect, it } from "vitest";
import { getLocalDateString, isSameLocalDay } from "./utils";

describe("date helpers", () => {
  it("formata a data usando o calendário local", () => {
    expect(getLocalDateString(new Date(2026, 8, 25, 23, 30))).toBe("2026-09-25");
  });

  it("reconhece registros do mesmo dia local", () => {
    expect(isSameLocalDay(new Date(2026, 8, 25, 0, 1), new Date(2026, 8, 25, 23, 59))).toBe(true);
    expect(isSameLocalDay(new Date(2026, 8, 24, 23, 59), new Date(2026, 8, 25, 0, 1))).toBe(false);
  });
});
