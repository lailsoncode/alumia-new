import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../src/app.js";

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
      body: JSON.stringify({ message: "Eu quero morrer" }),
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
    generate: async ({ message }) => `Resposta para: ${message}`,
    allowedOrigins: new Set(["http://localhost:8080"]),
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/v1/chat`, {
      method: "POST",
      headers: {
        "authorization": "Bearer valid",
        "content-type": "application/json",
        "origin": "http://localhost:8080",
      },
      body: JSON.stringify({ message: "Um próximo passo" }),
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
      body: JSON.stringify({ message: "Quero conversar" }),
    });
    assert.equal(limited.status, 429);
    assert.equal(limited.headers.get("retry-after"), "30");
    assert.equal(generated, false);

    const safety = await fetch(`${baseUrl}/v1/chat`, {
      method: "POST",
      headers: { "authorization": "Bearer valid", "content-type": "application/json" },
      body: JSON.stringify({ message: "Eu quero morrer" }),
    });
    assert.equal(safety.status, 200);
    assert.equal((await safety.json()).mode, "safety");
  });
});
