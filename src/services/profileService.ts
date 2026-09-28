import { evaluateAchievements } from "@/lib/achievements";
import { getAchievementActivity, getCycleAchievementActivity } from "./achievementService";

export interface JourneySummary {
  memberSince: string;
  completedTasks: number;
  checkins: number;
  hydrationDays: number;
  mindfulnessSessions: number;
  studySessions: number;
  earnedAchievements: number;
}

export async function getJourneySummary(): Promise<JourneySummary> {
  const activity = await getAchievementActivity();
  if (!activity) {
    throw new Error("Usuário não autenticado.");
  }

  return {
    memberSince: activity.originalAccountCreatedAt,
    completedTasks: activity.completedTasks.length,
    checkins: activity.checkins.length,
    hydrationDays: new Set(activity.hydration.map((item) => item.date)).size,
    mindfulnessSessions: activity.mindfulness.length,
    studySessions: activity.study.length,
    earnedAchievements: evaluateAchievements(getCycleAchievementActivity(activity)).filter((item) => item.earned).length,
  };
}
