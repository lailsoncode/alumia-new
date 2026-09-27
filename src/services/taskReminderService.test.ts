import { describe, expect, it } from "vitest";
import { getTaskNotificationId, getTaskReminderDate, getTaskReminderRoute, getTaskScheduleDate } from "./taskReminderService";

describe("taskReminderService", () => {
  it("calcula o instante do lembrete no horário local", () => {
    const date = getTaskReminderDate({ date: "2026-09-26", time: "15:30", reminder: "15min" });
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(8);
    expect(date?.getDate()).toBe(26);
    expect(date?.getHours()).toBe(15);
    expect(date?.getMinutes()).toBe(15);
  });

  it("agenda a notificação padrão mesmo sem alarme opcional", () => {
    const date = getTaskScheduleDate({ date: "2026-09-26", time: "15:30" });
    expect(date?.getHours()).toBe(15);
    expect(date?.getMinutes()).toBe(30);
  });

  it("gera um identificador nativo estável e positivo", () => {
    const taskId = "05c45ef0-8d3a-4e37-baf3-e4490dc4a544";
    const first = getTaskNotificationId(taskId);
    expect(first).toBe(getTaskNotificationId(taskId));
    expect(first).not.toBe(getTaskNotificationId(taskId, "reminder"));
    expect(first).toBeGreaterThan(0);
    expect(first).toBeLessThanOrEqual(0x7fffffff);
  });

  it("direciona compromissos acadêmicos ao módulo Estudante", () => {
    expect(getTaskReminderRoute({ module_key: "student" })).toBe("/estudante");
    expect(getTaskReminderRoute({ module_key: "tasks" })).toBe("/tarefas");
  });
});
