import assert from "node:assert/strict";
import test from "node:test";
import { createMemoryReader, normalizeMemoryProposal } from "../src/memory.js";

test("proposta exige evidência na mensagem atual", () => {
  const call = { name: "propose_user_memory", args: { content: "Gosta de beach tênis", quote: "gosto de beach tênis" } };
  assert.deepEqual(normalizeMemoryProposal(call, "Eu gosto de beach tênis"), { content: "Gosta de beach tênis" });
  assert.equal(normalizeMemoryProposal(call, "Bom dia"), null);
  assert.equal(normalizeMemoryProposal({ ...call, name: "save_anything" }, "Eu gosto de beach tênis"), null);
  assert.equal(normalizeMemoryProposal({ ...call, args: { content: "x".repeat(241), quote: "gosto" } }, "gosto"), null);
});

test("leitura usa identidade e JWT do usuário, restringe campos e volume", async () => {
  const read = createMemoryReader({ supabaseUrl: "https://example.test", supabaseAnonKey: "public", fetchImpl: async (url, options) => {
    assert.match(url, /user_id=eq.user-1/);
    assert.match(url, /limit=50/);
    assert.equal(options.headers.authorization, "Bearer user-token");
    return Response.json([{ content: "Aprende inglês", updated_at: "2026-09-27" }, { content: "x".repeat(241) }]);
  } });
  assert.deepEqual(await read({ userId: "user-1", token: "user-token" }), ["Aprende inglês"]);
});
