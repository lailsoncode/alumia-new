import { supabase } from "@/lib/supabaseClient";
import type {
  CareCheckinHistoryItem,
  CheckinEmotion,
  CheckinNeed,
  CreateCareCheckinInput,
  CreateCareCheckinResult,
  MoodCategory,
} from "@/types";

interface HistoryEmotionRelation {
  emotion_code: string;
  emotion: { label: string; emoji: string } | { label: string; emoji: string }[] | null;
}

interface HistoryRow {
  id: string;
  occurred_at: string;
  need_code: string | null;
  mood_category: MoodCategory;
  emotions: HistoryEmotionRelation[] | null;
  need: { label: string } | { label: string }[] | null;
  suggestion: { title: string; body: string; action_text: string } | { title: string; body: string; action_text: string }[] | null;
}

function firstRelation<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function getCheckinCatalogs(): Promise<{
  emotions: CheckinEmotion[];
  needs: CheckinNeed[];
}> {
  const [emotionsResult, needsResult] = await Promise.all([
    supabase
      .from("checkin_emotions")
      .select("code, label, emoji, valence, sort_order")
      .eq("published", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("checkin_needs")
      .select("code, label, emoji, sort_order")
      .eq("published", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (emotionsResult.error) throw emotionsResult.error;
  if (needsResult.error) throw needsResult.error;

  return {
    emotions: (emotionsResult.data ?? []).map((emotion) => ({
      code: emotion.code,
      label: emotion.label,
      emoji: emotion.emoji,
      valence: emotion.valence as CheckinEmotion["valence"],
      sortOrder: emotion.sort_order,
    })),
    needs: (needsResult.data ?? []).map((need) => ({
      code: need.code,
      label: need.label,
      emoji: need.emoji,
      sortOrder: need.sort_order,
    })),
  };
}

export async function createCareCheckin(input: CreateCareCheckinInput): Promise<CreateCareCheckinResult> {
  const { data, error } = await supabase.rpc("create_care_checkin", {
    p_emotion_codes: input.emotionCodes,
    p_need_code: input.needCode,
    p_idempotency_key: input.idempotencyKey,
  });

  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("O check-in não retornou uma sugestão.");

  return {
    checkinId: row.checkin_id,
    occurredAt: row.occurred_at,
    moodCategory: row.mood_category as MoodCategory,
    suggestion: {
      code: row.suggestion_code,
      version: row.suggestion_version,
      title: row.suggestion_title,
      body: row.suggestion_body,
      actionText: row.suggestion_action_text,
      actionCategory: row.suggestion_action_category,
    },
  };
}

export async function getCareCheckinHistory(page = 0, pageSize = 20): Promise<CareCheckinHistoryItem[]> {
  const start = page * pageSize;
  const end = start + pageSize - 1;
  const { data, error } = await supabase
    .from("care_checkins")
    .select(`
      id,
      occurred_at,
      need_code,
      mood_category,
      emotions:care_checkin_emotions(
        emotion_code,
        emotion:checkin_emotions!care_checkin_emotions_emotion_code_fkey(label, emoji)
      ),
      need:checkin_needs!care_checkins_need_code_fkey(label),
      suggestion:checkin_suggestion_snapshots(title, body, action_text)
    `)
    .order("occurred_at", { ascending: false })
    .range(start, end);

  if (error) throw error;

  return ((data ?? []) as unknown as HistoryRow[]).map((row) => {
    const need = firstRelation(row.need);
    const suggestion = firstRelation(row.suggestion);
    return {
      id: row.id,
      occurredAt: row.occurred_at,
      moodCategory: row.mood_category,
      emotions: (row.emotions ?? []).map((relation) => {
        const emotion = firstRelation(relation.emotion);
        return {
          code: relation.emotion_code,
          label: emotion?.label ?? relation.emotion_code,
          emoji: emotion?.emoji ?? "",
        };
      }),
      need: row.need_code ? { code: row.need_code, label: need?.label ?? row.need_code } : null,
      suggestion: suggestion
        ? { title: suggestion.title, body: suggestion.body, actionText: suggestion.action_text }
        : null,
    };
  });
}

export async function deleteCareCheckin(checkinId: string): Promise<void> {
  const { error } = await supabase.from("care_checkins").delete().eq("id", checkinId);
  if (error) throw error;
}
