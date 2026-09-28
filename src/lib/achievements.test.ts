import { describe, expect, it } from "vitest";
import { evaluateAchievements, filterAchievementActivity } from "./achievements";
import type { AchievementActivity } from "@/types/achievements";

const emptyActivity: AchievementActivity = {
  accountCreatedAt: "2026-01-01T12:00:00.000Z",
  originalAccountCreatedAt: "2026-01-01T12:00:00.000Z",
  completedTasks: [],
  checkins: [],
  hydration: [],
  mindfulness: [],
  study: [],
};

describe("evaluateAchievements", () => {
  it("starts with welcoming achievements and no punitive progress", () => {
    const achievements = evaluateAchievements(emptyActivity);
    expect(achievements).toHaveLength(14);
    expect(achievements.filter((item) => item.earned).map((item) => item.id)).toEqual(["inicio", "beta"]);
  });

  it("recognizes real care actions across modules", () => {
    const achievements = evaluateAchievements({
      ...emptyActivity,
      completedTasks: Array.from({ length: 5 }, (_, index) => ({
        completedAt: `2026-01-0${index + 2}T12:00:00.000Z`,
        createdAt: "2026-01-01T12:00:00.000Z",
        moduleKey: "tasks",
      })),
      checkins: [{ occurredAt: "2026-01-02T13:00:00.000Z", needCode: "support", moodCategory: "positive" }],
      hydration: [{ createdAt: "2026-01-02T14:00:00.000Z", date: "2026-01-02", amountMl: 250 }],
      mindfulness: [{ startedAt: "2026-01-02T22:00:00.000Z", practiceCode: "slow_evening", reflection: "present", endedEarly: false }],
      study: [{ startedAt: "2026-01-02T15:00:00.000Z", outcome: "progress" }],
    });

    expect(achievements.every((item) => item.earned)).toBe(true);
  });

  it("does not require consecutive days for Se achegue", () => {
    const achievements = evaluateAchievements({
      ...emptyActivity,
      hydration: [
        { createdAt: "2026-01-02T14:00:00.000Z", date: "2026-01-02", amountMl: 250 },
        { createdAt: "2026-08-20T14:00:00.000Z", date: "2026-08-20", amountMl: 250 },
      ],
    });

    expect(achievements.find((item) => item.id === "se-achegue")?.earned).toBe(true);
  });

  it("starts a new cycle without deleting historical activity", () => {
    const activity = {
      ...emptyActivity,
      completedTasks: [
        { completedAt: "2026-01-02T12:00:00.000Z", createdAt: "2026-01-01T12:00:00.000Z", moduleKey: "tasks" },
        { completedAt: "2026-09-28T12:00:00.000Z", createdAt: "2026-09-28T10:00:00.000Z", moduleKey: "tasks" },
      ],
    };

    const cycle = filterAchievementActivity(activity, "2026-09-27T16:15:48.000Z");
    expect(activity.completedTasks).toHaveLength(2);
    expect(cycle.completedTasks).toHaveLength(1);
    expect(evaluateAchievements(cycle).find((item) => item.id === "colheita-do-dia")?.earned).toBe(true);
  });
});
