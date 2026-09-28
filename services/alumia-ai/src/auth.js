export function createSupabaseAuthorizer({ supabaseUrl, supabaseAnonKey, fetchImpl = fetch }) {
  return async function authorize(token) {
    const response = await fetchImpl(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabaseAnonKey,
        authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) return null;
    const user = await response.json();
    if (typeof user?.id !== "string") return null;
    let contextEnabled = false;
    let memoryEnabled = false;
    let financeContextEnabled = false;
    try {
      const preference = await fetchImpl(`${supabaseUrl}/rest/v1/alumia_ai_preferences?user_id=eq.${encodeURIComponent(user.id)}&select=conversation_context,consent_version,memory_enabled,memory_consent_version,finance_context,finance_consent_version&limit=1`, {
        headers: { apikey: supabaseAnonKey, authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(5_000),
      });
      if (preference.ok) {
        const rows = await preference.json();
        contextEnabled = rows[0]?.consent_version === 1 && rows[0]?.conversation_context === true;
        memoryEnabled = rows[0]?.memory_consent_version === 2 && rows[0]?.memory_enabled === true;
        financeContextEnabled = rows[0]?.finance_consent_version === 1 && rows[0]?.finance_context === true;
      }
    } catch { /* Failure to check consent must never enable context. */ }
    return { id: user.id, contextEnabled, memoryEnabled, financeContextEnabled };
  };
}
