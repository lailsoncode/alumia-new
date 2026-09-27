import { supabase } from "@/lib/supabaseClient";

export type AlumiaMemorySource = "user_confirmed" | "onboarding_confirmed" | "assistant_learned" | "module_observed";
export type AlumiaMemoryModule = "tasks" | "student" | "hydration" | "mindfulness";
export interface AlumiaMemory { id: string; content: string; updated_at: string; source: AlumiaMemorySource; source_module?: AlumiaMemoryModule | null }
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
  await userId();
  const { error } = await supabase.rpc("set_alumia_learning_enabled", { p_enabled: enabled });
  if (error) throw error;
}

export async function getMemories(): Promise<AlumiaMemory[]> {
  const { data, error } = await supabase.from("alumia_memories").select("id, content, updated_at, source, source_module")
    .eq("user_id", await userId()).order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveMemory(content: string, id?: string, source: AlumiaMemorySource = "user_confirmed") {
  const value = content.trim();
  if (!value || value.length > 240) throw new Error("INVALID_MEMORY");
  const owner = await userId();
  if (id) {
    const { error } = await supabase.rpc("update_alumia_memory", { p_memory_id: id, p_content: value });
    if (error) throw error;
    return;
  }
  const payload = { content: value, updated_at: new Date().toISOString(), source };
  const { data, error } = await supabase.from("alumia_memories").upsert({ ...payload, user_id: owner }, { onConflict: "user_id,content" }).select("id").single();
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
  await userId();
  const { error } = await supabase.rpc("forget_alumia_memory", { p_memory_id: id });
  if (error) throw error;
}

export async function forgetAllMemories() {
  await userId();
  const { error } = await supabase.rpc("forget_all_alumia_memories");
  if (error) throw error;
}
