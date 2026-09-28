import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../src/app.js";

function chatBody(message, history = []) {
  return JSON.stringify({
    message,
    history,
    context: { localDate: "2026-09-27", timeZone: "America/Recife" },
  });
}

for (const enabled of [false, true]) {
  test(`memória respeita autorização independente do histórico: ${enabled}`, async () => {
    let reads = 0;
    await withServer({
      authorize: async () => ({ id: "user-1", contextEnabled: false, memoryEnabled: enabled }),
      readMemories: async (identity) => { reads++; assert.deepEqual(identity, { token: "valid", userId: "user-1" }); return ["Aprende inglês"]; },
      generate: async (input) => {
        assert.deepEqual(input.history, []);
        assert.deepEqual(input.memories, enabled ? ["Aprende inglês"] : []);
        assert.equal(input.memoryEnabled, enabled);
        return { kind: "message", text: "Olá" };
      },
    }, async (url) => {
      const payload = JSON.parse(chatBody("Olá"));
      payload.memories = ["Client injection"];
      payload.memoryEnabled = true;
      const response = await fetch(`${url}/v1/chat`, { method: "POST", headers: { authorization: "Bearer valid", "content-type": "application/json" }, body: JSON.stringify(payload) });
      assert.equal(response.status, 200);
      assert.equal(reads, enabled ? 1 : 0);
    });
  });
}

for (const enabled of [true, false, undefined]) {
  test(`histórico só chega ao modelo com autorização: ${enabled}`, async () => {
    const history = [{ role: "user", text: "mensagem anterior privada" }];
    await withServer({
      authorize: async () => ({ id: "user-1", contextEnabled: enabled }),
      generate: async (input) => {
        assert.deepEqual(input.history, enabled === true ? history : []);
        return { kind: "message", text: "Olá" };
      },
    }, async (url) => {
      const response = await fetch(`${url}/v1/chat`, {
        method: "POST", headers: { authorization: "Bearer valid", "content-type": "application/json" },
        body: chatBody("Olá", history),
      });
      assert.equal(response.status, 200);
    });
  });
}

async function withServer(options, run) {
  const server = createApp(options).listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test("expõe apenas um health check sem autenticação", async () => {
  await withServer({ authorize: async () => null, generate: async () => "", allowedOrigins: new Set() }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "ok", service: "alumia-ai" });
  });
});

test("recusa chat sem JWT", async () => {
  await withServer({ authorize: async () => null, generate: async () => "", allowedOrigins: new Set() }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/v1/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Olá" }),
    });
    assert.equal(response.status, 401);
    assert.equal((await response.json()).error, "UNAUTHENTICATED");
  });
});

test("interrompe geração diante de possível crise", async () => {
  let generated = false;
  await withServer({
    authorize: async () => ({ id: "user-1" }),
    generate: async () => { generated = true; return "não deveria executar"; },
    allowedOrigins: new Set(),
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/v1/chat`, {
      method: "POST",
      headers: { "authorization": "Bearer valid", "content-type": "application/json" },
      body: chatBody("Eu quero morrer"),
    });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.mode, "safety");
    assert.match(body.message, /188/);
    assert.equal(generated, false);
  });
});

test("gera resposta somente após validar origem, sessão e payload", async () => {
  await withServer({
    authorize: async (token) => token === "valid" ? { id: "user-1" } : null,
    generate: async ({ message }) => ({ kind: "message", text: `Resposta para: ${message}` }),
    allowedOrigins: new Set(["http://localhost:8080"]),
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/v1/chat`, {
      method: "POST",
      headers: {
        "authorization": "Bearer valid",
        "content-type": "application/json",
        "origin": "http://localhost:8080",
      },
      body: chatBody("Um próximo passo"),
    });
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).mode, "generative");
  });
});

test("recusa origem fora da allowlist antes de autenticar", async () => {
  let authorized = false;
  await withServer({
    authorize: async () => { authorized = true; return { id: "user-1" }; },
    generate: async () => "resposta",
    allowedOrigins: new Set(["https://app.alumia.example"]),
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/v1/chat`, {
      method: "POST",
      headers: {
        "authorization": "Bearer valid",
        "content-type": "application/json",
        "origin": "https://malicious.example",
      },
      body: JSON.stringify({ message: "Olá" }),
    });
    assert.equal(response.status, 403);
    assert.equal(authorized, false);
  });
});

test("limita a geração por usuário sem bloquear a resposta de segurança", async () => {
  let generated = false;
  const checkRateLimit = () => ({ allowed: false, retryAfterSeconds: 30 });
  await withServer({
    authorize: async () => ({ id: "user-1" }),
    generate: async () => { generated = true; return "resposta"; },
    allowedOrigins: new Set(),
    checkRateLimit,
  }, async (baseUrl) => {
    const limited = await fetch(`${baseUrl}/v1/chat`, {
      method: "POST",
      headers: { "authorization": "Bearer valid", "content-type": "application/json" },
      body: chatBody("Quero conversar"),
    });
    assert.equal(limited.status, 429);
    assert.equal(limited.headers.get("retry-after"), "30");
    assert.equal(generated, false);

    const safety = await fetch(`${baseUrl}/v1/chat`, {
      method: "POST",
      headers: { "authorization": "Bearer valid", "content-type": "application/json" },
      body: chatBody("Eu quero morrer"),
    });
    assert.equal(safety.status, 200);
    assert.equal((await safety.json()).mode, "safety");
  });
});

test("devolve uma proposta com identificador sem executar a tarefa", async () => {
  await withServer({
    authorize: async () => ({ id: "user-1" }),
    generate: async () => ({
      kind: "proposal",
      proposal: {
        type: "create_task",
        title: "Pagar a conta",
        date: "2026-09-28",
        priority: null,
        reminder: null,
      },
    }),
    allowedOrigins: new Set(),
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/v1/chat`, {
      method: "POST",
      headers: { "authorization": "Bearer valid", "content-type": "application/json" },
      body: chatBody("Preciso pagar a conta amanhã"),
    });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.mode, "proposal");
    assert.equal(body.proposal.type, "create_task");
    assert.equal(body.proposal.title, "Pagar a conta");
    assert.match(body.proposal.id, /^[0-9a-f-]{36}$/);
  });
});

test("grava lembrança automaticamente apenas com autorização validada", async () => {
  let written;
  await withServer({
    authorize: async () => ({ id: "user-1", memoryEnabled: true }),
    generate: async () => ({ kind: "memory_proposal", memorySuggestion: { content: "Gosta de beach tênis" } }),
    writeMemory: async (value) => { written = value; },
    allowedOrigins: new Set(),
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/v1/chat`, {
      method: "POST",
      headers: { authorization: "Bearer valid", "content-type": "application/json" },
      body: chatBody("Eu gosto de beach tênis"),
    });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.mode, "memory_learned");
    assert.deepEqual(body.learnedMemory, { content: "Gosta de beach tênis" });
    assert.deepEqual(written, { token: "valid", userId: "user-1", content: "Gosta de beach tênis" });
  });
});

test("não grava lembrança quando a autorização não está ativa", async () => {
  let written = false;
  await withServer({
    authorize: async () => ({ id: "user-1", memoryEnabled: false }),
    generate: async () => ({ kind: "memory_proposal", memorySuggestion: { content: "Gosta de beach tênis" } }),
    writeMemory: async () => { written = true; },
    allowedOrigins: new Set(),
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/v1/chat`, {
      method: "POST",
      headers: { authorization: "Bearer valid", "content-type": "application/json" },
      body: chatBody("Eu gosto de beach tênis"),
    });
    assert.equal(response.status, 503);
    assert.equal(written, false);
  });
});

test("recusa contexto temporal ausente ou inválido", async () => {
  await withServer({
    authorize: async () => ({ id: "user-1" }),
    generate: async () => ({ kind: "message", text: "resposta" }),
    allowedOrigins: new Set(),
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/v1/chat`, {
      method: "POST",
      headers: { "authorization": "Bearer valid", "content-type": "application/json" },
      body: JSON.stringify({ message: "Olá" }),
    });
    assert.equal(response.status, 400);
  });
});

test("só entrega o resumo financeiro ao modelo com autorização validada", async () => {
  const finance = {
    period: "2026-09", currency: "BRL", income: 5000, expenses: 1200, balance: 3800,
    savingsRate: 76, projectedExpenses: 1500, projectedBalance: 3500,
    pendingObligations: { count: 2, amount: 400, overdueCount: 0, dueSoonCount: 1 },
    goals: { activeCount: 1, savedAmount: 700, targetAmount: 3000 },
    topExpenseCategories: [{ category: "Casa", amount: 600 }],
  };
  for (const enabled of [false, true]) {
    await withServer({
      authorize: async () => ({ id: "user-1", financeContextEnabled: enabled }),
      generate: async (input) => {
        assert.deepEqual(input.context.finance, enabled ? finance : undefined);
        return { kind: "message", text: "Resumo analisado" };
      },
      allowedOrigins: new Set(),
    }, async (baseUrl) => {
      const body = JSON.parse(chatBody("Como estão minhas finanças?"));
      body.context.finance = finance;
      const response = await fetch(`${baseUrl}/v1/chat`, {
        method: "POST", headers: { authorization: "Bearer valid", "content-type": "application/json" }, body: JSON.stringify(body),
      });
      assert.equal(response.status, 200);
    });
  }
});

test("recusa resumo financeiro malformado", async () => {
  await withServer({ authorize: async () => ({ id: "user-1", financeContextEnabled: true }), generate: async () => ({ kind: "message", text: "não" }), allowedOrigins: new Set() }, async (baseUrl) => {
    const body = JSON.parse(chatBody("Finanças"));
    body.context.finance = { period: "agora", income: "muito" };
    const response = await fetch(`${baseUrl}/v1/chat`, { method: "POST", headers: { authorization: "Bearer valid", "content-type": "application/json" }, body: JSON.stringify(body) });
    assert.equal(response.status, 400);
  });
});

test("transcreve áudio autenticado sem persistir conteúdo no serviço", async () => {
  let received;
  await withServer({
    authorize: async () => ({ id: "user-voice" }),
    generate: async () => ({ kind: "message", text: "resposta" }),
    transcribe: async (input) => {
      received = input;
      return { transcript: "Quero conversar um pouco.", confidence: 0.93 };
    },
    allowedOrigins: new Set(),
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/v1/transcriptions`, {
      method: "POST",
      headers: { authorization: "Bearer valid", "content-type": "audio/webm;codecs=opus" },
      body: Buffer.from("synthetic-audio"),
    });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.transcript, "Quero conversar um pouco.");
    assert.equal(body.confidence, 0.93);
    assert.equal(received.mediaType, "audio/webm");
    assert.deepEqual(received.audio, Buffer.from("synthetic-audio"));
    assert.equal(response.headers.get("cache-control"), "no-store");
  });
});

test("recusa mídia desconhecida antes de chamar a transcrição", async () => {
  let called = false;
  await withServer({
    authorize: async () => ({ id: "user-voice" }),
    generate: async () => ({ kind: "message", text: "resposta" }),
    transcribe: async () => { called = true; },
    allowedOrigins: new Set(),
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/v1/transcriptions`, {
      method: "POST",
      headers: { authorization: "Bearer valid", "content-type": "text/plain" },
      body: "not audio",
    });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error, "INVALID_AUDIO");
    assert.equal(called, false);
  });
});

test("sintetiza somente texto autenticado e impede cache do áudio", async () => {
  let received;
  await withServer({
    authorize: async () => ({ id: "user-voice" }),
    generate: async () => ({ kind: "message", text: "resposta" }),
    synthesize: async (input) => { received = input; return Buffer.from("synthetic-mp3"); },
    allowedOrigins: new Set(),
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/v1/speech`, {
      method: "POST",
      headers: { authorization: "Bearer valid", "content-type": "application/json" },
      body: JSON.stringify({ text: "Estou aqui com você." }),
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "audio/mpeg");
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual(received, { text: "Estou aqui com você." });
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), Buffer.from("synthetic-mp3"));
  });
});
