import { supabase } from "@/lib/supabaseClient";

export async function getAlumiaContextPreference(): Promise<boolean | null> {
  const { data: session, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session.session) throw new Error("SESSION_UNAVAILABLE");
  const { data, error } = await supabase.from("alumia_ai_preferences")
    .select("conversation_context, consent_version").eq("user_id", session.session.user.id).maybeSingle();
  if (error) throw error;
  return data?.consent_version === 1 ? data.conversation_context === true : null;
}

export async function setAlumiaContextPreference(enabled: boolean) {
  const { data, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !data.session) throw new Error("SESSION_UNAVAILABLE");
  const { error } = await supabase.from("alumia_ai_preferences").upsert({
    user_id: data.session.user.id,
    conversation_context: enabled,
    consent_version: 1,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function getAlumiaFinanceContextPreference(): Promise<boolean> {
  const { data: session, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session.session) throw new Error("SESSION_UNAVAILABLE");
  const { data, error } = await supabase.from("alumia_ai_preferences")
    .select("finance_context, finance_consent_version").eq("user_id", session.session.user.id).maybeSingle();
  if (error) throw error;
  return data?.finance_consent_version === 1 && data.finance_context === true;
}

export async function setAlumiaFinanceContextPreference(enabled: boolean) {
  const { data, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !data.session) throw new Error("SESSION_UNAVAILABLE");
  const { error } = await supabase.from("alumia_ai_preferences").upsert({
    user_id: data.session.user.id,
    finance_context: enabled,
    finance_consent_version: 1,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}
