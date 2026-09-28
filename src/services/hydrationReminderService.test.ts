import { describe, expect, it } from "vitest";
import { getHydrationReminderTimes } from "./hydrationReminderService";

describe("hydrationReminderService", () => {
  it("distribui os lembretes dentro da janela escolhida", () => {
    expect(getHydrationReminderTimes({ enabled: true, startHour: 8, endHour: 20, intervalHours: 3 })).toEqual([8, 11, 14, 17, 20]);
  });

  it("limita a quantidade de notificações recorrentes", () => {
    expect(getHydrationReminderTimes({ enabled: true, startHour: 0, endHour: 23, intervalHours: 2 })).toHaveLength(8);
  });
});
