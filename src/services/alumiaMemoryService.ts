import { supabase } from "@/lib/supabaseClient";

export type AlumiaMemorySource = "user_confirmed" | "onboarding_confirmed" | "assistant_learned" | "module_observed";
export interface AlumiaMemory { id: string; content: string; updated_at: string; source: AlumiaMemorySource }
export interface AlumiaLearningPreference { enabled: boolean; decided: boolean; onboardingCompleted: boolean }

async function userId() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new Error("SESSION_UNAVAILABLE");
  return data.session.user.id;
}

export async function getMemoryEnabled() {
  return (await getLearningPreference()).enabled;
}

export async function getLearningPreference(): Promise<AlumiaLearningPreference> {
  const id = await userId();
  const { data, error } = await supabase.from("alumia_ai_preferences")
    .select("memory_enabled, memory_consent_version, memory_onboarding_completed_at").eq("user_id", id).maybeSingle();
  if (error) throw error;
  const decided = data?.memory_consent_version === 2;
  return {
    enabled: decided && data?.memory_enabled === true,
    decided,
    onboardingCompleted: decided && Boolean(data?.memory_onboarding_completed_at),
  };
}

export async function setMemoryEnabled(enabled: boolean) {
  const now = new Date().toISOString();
  const { error } = await supabase.from("alumia_ai_preferences").upsert({
    user_id: await userId(),
    memory_enabled: enabled,
    memory_consent_version: 2,
    memory_consent_at: enabled ? now : null,
    memory_revoked_at: enabled ? null : now,
    updated_at: now,
  });
  if (error) throw error;
}

export async function getMemories(): Promise<AlumiaMemory[]> {
  const { data, error } = await supabase.from("alumia_memories").select("id, content, updated_at, source")
    .eq("user_id", await userId()).order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveMemory(content: string, id?: string, source: AlumiaMemorySource = "user_confirmed") {
  const value = content.trim();
  if (!value || value.length > 240) throw new Error("INVALID_MEMORY");
  const owner = await userId();
  const payload = { content: value, updated_at: new Date().toISOString(), source };
  const query = id
    ? supabase.from("alumia_memories").update(payload).eq("id", id).eq("user_id", owner)
    : supabase.from("alumia_memories").upsert({ ...payload, user_id: owner }, { onConflict: "user_id,content" });
  const { data, error } = await query.select("id").single();
  if (error || !data) throw error ?? new Error("MEMORY_NOT_FOUND");
}

export async function completeLearningOnboarding(memories: string[]) {
  const values = [...new Set(memories.map((value) => value.trim()).filter(Boolean))];
  if (values.some((value) => value.length > 240)) throw new Error("INVALID_MEMORY");
  const owner = await userId();
  if (values.length) {
    const now = new Date().toISOString();
    const { error } = await supabase.from("alumia_memories").upsert(
      values.map((content) => ({ user_id: owner, content, source: "onboarding_confirmed", updated_at: now })),
      { onConflict: "user_id,content" },
    );
    if (error) throw error;
  }
  const { error } = await supabase.from("alumia_ai_preferences").update({
    memory_onboarding_completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("user_id", owner).eq("memory_enabled", true).eq("memory_consent_version", 2);
  if (error) throw error;
}

export async function forgetMemory(id: string) {
  const { error } = await supabase.from("alumia_memories").delete().eq("id", id).eq("user_id", await userId());
  if (error) throw error;
}

export async function forgetAllMemories() {
  const { error } = await supabase.from("alumia_memories").delete().eq("user_id", await userId());
  if (error) throw error;
}
