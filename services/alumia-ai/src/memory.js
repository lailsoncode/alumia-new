export const PROPOSE_MEMORY = {
  name: "remember_user_fact",
  description: "Registra, quando o aprendizado estiver autorizado, um hobby, preferência ou objetivo não sensível explicitamente declarado na mensagem atual.",
  parametersJsonSchema: {
    type: "object", additionalProperties: false,
    properties: {
      content: { type: "string", description: "Fato pessoal sobre hobby, preferência ou objetivo de aprendizado, no máximo 240 caracteres, sem inferências." },
      quote: { type: "string", description: "Trecho literal da mensagem atual que declara esse fato sobre o próprio usuário." },
    },
    required: ["content", "quote"],
  },
};

export function normalizeMemoryProposal(call, message) {
  if (call?.name !== "remember_user_fact") return null;
  const { content, quote } = call.args ?? {};
  if (typeof content !== "string" || typeof quote !== "string") return null;
  const value = content.trim();
  if (!value || value.length > 240 || quote.trim().length < 5 || !message.includes(quote)) return null;
  return { content: value };
}

export function createMemoryWriter({ supabaseUrl, supabaseAnonKey, fetchImpl = fetch }) {
  return async ({ token, userId, content }) => {
    const response = await fetchImpl(`${supabaseUrl}/rest/v1/alumia_memories?on_conflict=user_id,content`, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({ user_id: userId, content, source: "assistant_learned", updated_at: new Date().toISOString() }),
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) throw new Error("MEMORY_WRITE_FAILED");
  };
}

export function createMemoryReader({ supabaseUrl, supabaseAnonKey, fetchImpl = fetch }) {
  return async ({ token, userId }) => {
    const response = await fetchImpl(`${supabaseUrl}/rest/v1/alumia_memories?user_id=eq.${encodeURIComponent(userId)}&select=content,updated_at&order=updated_at.desc&limit=50`, {
      headers: { apikey: supabaseAnonKey, authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) throw new Error("MEMORY_UNAVAILABLE");
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error("MEMORY_INVALID");
    return rows.filter((row) => typeof row.content === "string" && row.content.length <= 240)
      .slice(0, 50).map(({ content }) => content);
  };
}
