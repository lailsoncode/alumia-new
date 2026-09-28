import { evaluateAchievements, filterAchievementActivity } from "@/lib/achievements";
import { supabase } from "@/lib/supabaseClient";
import type { Achievement, AchievementActivity } from "@/types/achievements";
import { ACHIEVEMENT_CYCLE } from "@/lib/achievement-cycle";

export const ACHIEVEMENT_ACTIVITY_EVENT = "alumia:achievement-activity";

export function notifyAchievementActivity() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(ACHIEVEMENT_ACTIVITY_EVENT));
}

export async function getAchievementActivity(): Promise<AchievementActivity | null> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const user = sessionData.session?.user;
  if (!user) return null;

  const [tasks, checkins, hydration, mindfulness, study] = await Promise.all([
    supabase.from("tasks")
      .select("completed_at, created_at, module_key")
      .eq("user_id", user.id)
      .eq("done", true)
      .order("completed_at", { ascending: true }),
    supabase.from("care_checkins")
      .select("occurred_at, need_code, mood_category")
      .eq("user_id", user.id)
      .order("occurred_at", { ascending: true }),
    supabase.from("hydration_logs")
      .select("created_at, date, amount_ml")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase.from("mindfulness_sessions")
      .select("started_at, practice_code, reflection, ended_early")
      .eq("user_id", user.id)
      .order("started_at", { ascending: true }),
    supabase.from("student_study_sessions")
      .select("started_at, outcome")
      .eq("user_id", user.id)
      .order("started_at", { ascending: true }),
  ]);

  const error = tasks.error || checkins.error || hydration.error || mindfulness.error || study.error;
  if (error) throw error;

  return {
    accountCreatedAt: user.created_at,
    originalAccountCreatedAt: user.created_at,
    completedTasks: (tasks.data ?? []).map((item) => ({
      completedAt: item.completed_at,
      createdAt: item.created_at,
      moduleKey: item.module_key,
    })),
    checkins: (checkins.data ?? []).map((item) => ({
      occurredAt: item.occurred_at,
      needCode: item.need_code,
      moodCategory: item.mood_category,
    })),
    hydration: (hydration.data ?? []).map((item) => ({
      createdAt: item.created_at,
      date: item.date,
      amountMl: item.amount_ml,
    })),
    mindfulness: (mindfulness.data ?? []).map((item) => ({
      startedAt: item.started_at,
      practiceCode: item.practice_code,
      reflection: item.reflection,
      endedEarly: item.ended_early,
    })),
    study: (study.data ?? []).map((item) => ({
      startedAt: item.started_at,
      outcome: item.outcome,
    })),
  };
}

export function getCycleAchievementActivity(activity: AchievementActivity): AchievementActivity {
  return filterAchievementActivity(activity, ACHIEVEMENT_CYCLE.startsAt);
}

export async function getAchievements(): Promise<Achievement[]> {
  const activity = await getAchievementActivity();
  return activity ? evaluateAchievements(getCycleAchievementActivity(activity)) : [];
}
