import { supabase } from "@/lib/supabaseClient";
import { getMindfulnessReminderSchedule } from "@/lib/mindfulness";
import type {
  CompleteMindfulnessSessionInput,
  MindfulnessPractice,
  MindfulnessReminderChoice,
} from "@/types";
import { createTask } from "./tasksService";
import { notifyAchievementActivity } from "./achievementService";

interface MindfulnessPracticeRow {
  id: string;
  code: string;
  version: number;
  title: string;
  description: string;
  duration_minutes: number;
  category: MindfulnessPractice["category"];
  formats: MindfulnessPractice["formats"];
  instructions: string[];
  sort_order: number;
}

function mapPractice(row: MindfulnessPracticeRow): MindfulnessPractice {
  return {
    id: row.id,
    code: row.code,
    version: row.version,
    title: row.title,
    description: row.description,
    durationMinutes: row.duration_minutes,
    category: row.category,
    formats: row.formats,
    instructions: row.instructions,
    sortOrder: row.sort_order,
  };
}

async function requireAuthenticatedUser() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session?.user) throw new Error("Usuário não autenticado.");
}

export async function getMindfulnessPractices(): Promise<MindfulnessPractice[]> {
  await requireAuthenticatedUser();
  const { data, error } = await supabase
    .from("mindfulness_practices")
    .select("id, code, version, title, description, duration_minutes, category, formats, instructions, sort_order")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as MindfulnessPracticeRow[]).map(mapPractice);
}

export async function completeMindfulnessSession(input: CompleteMindfulnessSessionInput) {
  await requireAuthenticatedUser();
  const { data, error } = await supabase.rpc("create_mindfulness_session", {
    p_practice_id: input.practiceId,
    p_started_at: input.startedAt,
    p_elapsed_seconds: input.elapsedSeconds,
    p_format: input.format,
    p_reflection: input.reflection || null,
    p_ended_early: input.endedEarly,
  });
  if (error) throw error;
  notifyAchievementActivity();
  return data as string;
}

export async function scheduleMindfulnessReminder(practice: MindfulnessPractice, choice: MindfulnessReminderChoice) {
  const schedule = getMindfulnessReminderSchedule(choice);
  return createTask({
    title: `Pausa: ${practice.title}`,
    description: "Lembrete criado pelo módulo Mindfulness da Alumia.",
    date: schedule.date,
    time: schedule.time,
    priority: null,
    reminder: "na_hora",
    moduleKey: "mindfulness",
  });
}
