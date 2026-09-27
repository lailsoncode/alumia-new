import { supabase } from "@/lib/supabaseClient";

export interface AlumiaMemory { id: string; content: string; updated_at: string; source: "user_confirmed" }

async function userId() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new Error("SESSION_UNAVAILABLE");
  return data.session.user.id;
}

export async function getMemoryEnabled() {
  const id = await userId();
  const { data, error } = await supabase.from("alumia_ai_preferences")
    .select("memory_enabled, memory_consent_version").eq("user_id", id).maybeSingle();
  if (error) throw error;
  return data?.memory_enabled === true && data?.memory_consent_version === 1;
}

export async function setMemoryEnabled(enabled: boolean) {
  const { error } = await supabase.from("alumia_ai_preferences").upsert({
    user_id: await userId(), memory_enabled: enabled, memory_consent_version: 1, updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function getMemories(): Promise<AlumiaMemory[]> {
  const { data, error } = await supabase.from("alumia_memories").select("id, content, updated_at, source")
    .eq("user_id", await userId()).order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveMemory(content: string, id?: string) {
  const value = content.trim();
  if (!value || value.length > 240) throw new Error("INVALID_MEMORY");
  const owner = await userId();
  const payload = { content: value, updated_at: new Date().toISOString(), source: "user_confirmed" };
  const query = id
    ? supabase.from("alumia_memories").update(payload).eq("id", id).eq("user_id", owner)
    : supabase.from("alumia_memories").upsert({ ...payload, user_id: owner }, { onConflict: "user_id,content" });
  const { data, error } = await query.select("id").single();
  if (error || !data) throw error ?? new Error("MEMORY_NOT_FOUND");
}

export async function forgetMemory(id: string) {
  const { error } = await supabase.from("alumia_memories").delete().eq("id", id).eq("user_id", await userId());
  if (error) throw error;
}
