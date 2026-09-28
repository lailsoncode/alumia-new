import assert from "node:assert/strict";
import test from "node:test";
import { createSupabaseAuthorizer } from "../src/auth.js";

for (const [name, rows, expected] of [
  ["sem decisão", [], false],
  ["autorizado", [{ consent_version: 1, conversation_context: true }], true],
  ["revogado", [{ consent_version: 1, conversation_context: false }], false],
  ["versão desconhecida", [{ consent_version: 2, conversation_context: true }], false],
]) {
  test(`contexto ${name}`, async () => {
    const authorize = createSupabaseAuthorizer({ supabaseUrl: "https://example.test", supabaseAnonKey: "public", fetchImpl: async (url, options) => {
      assert.equal(options.headers.authorization, "Bearer session");
      if (url.endsWith("/auth/v1/user")) return Response.json({ id: "user-1" });
      assert.ok(url.includes("user_id=eq.user-1"));
      return Response.json(rows);
    } });
    assert.deepEqual(await authorize("session"), { id: "user-1", contextEnabled: expected, memoryEnabled: false, financeContextEnabled: false });
  });
}
test("falha da preferência não autoriza contexto", async () => {
  const authorize = createSupabaseAuthorizer({ supabaseUrl: "https://example.test", supabaseAnonKey: "public", fetchImpl: async (url) => {
    if (url.endsWith("/auth/v1/user")) return Response.json({ id: "user-1" });
    throw new Error("offline");
  } });
  assert.equal((await authorize("session")).contextEnabled, false);
});

test("memória tem autorização independente do contexto", async () => {
  const authorize = createSupabaseAuthorizer({ supabaseUrl: "https://example.test", supabaseAnonKey: "public", fetchImpl: async (url) => {
    if (url.endsWith("/auth/v1/user")) return Response.json({ id: "user-1" });
    return Response.json([{ conversation_context: false, consent_version: 1, memory_enabled: true, memory_consent_version: 2 }]);
  } });
  assert.deepEqual(await authorize("session"), { id: "user-1", contextEnabled: false, memoryEnabled: true, financeContextEnabled: false });
});

test("finanças têm autorização independente de conversa e memória", async () => {
  const authorize = createSupabaseAuthorizer({ supabaseUrl: "https://example.test", supabaseAnonKey: "public", fetchImpl: async (url) => {
    if (url.endsWith("/auth/v1/user")) return Response.json({ id: "user-1" });
    return Response.json([{ finance_context: true, finance_consent_version: 1 }]);
  } });
  assert.deepEqual(await authorize("session"), { id: "user-1", contextEnabled: false, memoryEnabled: false, financeContextEnabled: true });
});
