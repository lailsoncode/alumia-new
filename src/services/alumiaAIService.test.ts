import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { confirmAlumiaAction, respondToAlumia, synthesizeAlumiaSpeech, transcribeAlumiaAudio } from "./alumiaAIService";
import { createTask, getTasks } from "./tasksService";
import { getMindfulnessPractices } from "./mindfulnessService";
import { getFinanceDashboardData } from "./financeService";
import { supabase } from "@/lib/supabaseClient";
import { getAlumiaContextPreference, getAlumiaFinanceContextPreference } from "./alumiaPreferencesService";
vi.mock("./alumiaPreferencesService", () => ({ getAlumiaContextPreference: vi.fn(), getAlumiaFinanceContextPreference: vi.fn() }));

vi.mock("./tasksService", () => ({
  createTask: vi.fn(),
  getTasks: vi.fn(),
}));

vi.mock("./mindfulnessService", () => ({
  getMindfulnessPractices: vi.fn(),
}));

vi.mock("./financeService", () => ({ getFinanceDashboardData: vi.fn() }));

vi.mock("@/lib/supabaseClient", () => ({
  supabase: { auth: { getSession: vi.fn() } },
}));

const mockedGetTasks = vi.mocked(getTasks);
const mockedCreateTask = vi.mocked(createTask);
const mockedGetPractices = vi.mocked(getMindfulnessPractices);
const mockedGetSession = vi.mocked(supabase.auth.getSession);

describe("Alum.IA editorial provider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_ENABLE_ALUMIA_AI_GENERATIVE", "false");
    vi.mocked(getAlumiaContextPreference).mockResolvedValue(false);
    vi.mocked(getAlumiaFinanceContextPreference).mockResolvedValue(false);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("não consulta ferramentas diante de um possível sinal de crise", async () => {
    const result = await respondToAlumia("Eu quero me matar");

    expect(result.tone).toBe("safety");
    expect(result.text).toContain("188");
    expect(mockedGetTasks).not.toHaveBeenCalled();
    expect(mockedGetPractices).not.toHaveBeenCalled();
  });

  it("resume no máximo três tarefas sem alterá-las", async () => {
    mockedGetTasks.mockResolvedValue([
      { id: "1", title: "Uma", done: false },
      { id: "2", title: "Duas", done: false },
      { id: "3", title: "Três", done: false },
      { id: "4", title: "Quatro", done: false },
    ]);

    const result = await respondToAlumia("Quais são minhas tarefas?");

    expect(result.text).toContain("Uma");
    expect(result.text).toContain("Três");
    expect(result.text).not.toContain("• Quatro");
    expect(result.navigation?.to).toBe("/tarefas");
  });

  it("propõe uma tarefa sem executar escrita", async () => {
    const result = await respondToAlumia("Crie uma tarefa comprar pão");

    expect(result.proposedAction).toMatchObject({ type: "create_task", title: "comprar pão" });
    expect(mockedCreateTask).not.toHaveBeenCalled();
  });

  it("cria somente a ação explicitamente confirmada", async () => {
    mockedCreateTask.mockResolvedValue({ id: "task-1", title: "comprar pão" });

    await confirmAlumiaAction({
      id: "action-1",
      type: "create_task",
      title: "comprar pão",
      priority: null,
      reminder: null,
    });

    expect(mockedCreateTask).toHaveBeenCalledWith({
      title: "comprar pão",
      description: undefined,
      date: undefined,
      time: undefined,
      priority: null,
      reminder: null,
      moduleKey: "alumia_ai",
      idempotencyKey: "action-1",
    });
  });

  it("sugere a prática publicada mais breve", async () => {
    mockedGetPractices.mockResolvedValue([
      { id: "2", code: "long", version: 1, title: "Longa", description: "Sete minutos", durationMinutes: 7, category: "calm", formats: ["text"], instructions: ["Leia"], sortOrder: 2 },
      { id: "1", code: "short", version: 1, title: "Breve", description: "Três minutos", durationMinutes: 3, category: "grounding", formats: ["text"], instructions: ["Observe"], sortOrder: 1 },
    ]);

    const result = await respondToAlumia("Quero uma pausa breve");

    expect(result.text).toContain("Breve");
    expect(result.navigation?.to).toBe("/mindfulness");
  });

  it("usa o Cloud Run autenticado apenas quando a fase generativa está habilitada", async () => {
    vi.mocked(getAlumiaContextPreference).mockResolvedValue(true);
    vi.stubEnv("VITE_ENABLE_ALUMIA_AI_GENERATIVE", "true");
    vi.stubEnv("VITE_ALUMIA_AI_URL", "https://alumia-ai.example");
    mockedGetSession.mockResolvedValue({
      data: { session: { access_token: "jwt-valid" } },
      error: null,
    } as Awaited<ReturnType<typeof supabase.auth.getSession>>);
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      mode: "generative",
      message: "Podemos escolher um passo pequeno.",
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await respondToAlumia("Meu dia está confuso", [
      { id: "private-module-result", role: "assistant", text: "Tarefa privada", source: "editorial" },
      { id: "previous-user", role: "user", text: "Estou cansado" },
      { id: "previous-ai", role: "assistant", text: "Vamos com calma", source: "generative" },
    ]);

    expect(result).toMatchObject({ source: "generative", tone: "default" });
    expect(fetchMock).toHaveBeenCalledWith("https://alumia-ai.example/v1/chat", expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({ authorization: "Bearer jwt-valid" }),
    }));
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(String(request.body)).history).toEqual([
      { role: "user", text: "Estou cansado" },
      { role: "assistant", text: "Vamos com calma" },
    ]);
    expect(JSON.parse(String(request.body)).context).toEqual(expect.objectContaining({
      localDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      timeZone: expect.any(String),
    }));
  });

  it("transforma uma proposta remota em ação confirmável sem gravar", async () => {
    vi.stubEnv("VITE_ENABLE_ALUMIA_AI_GENERATIVE", "true");
    vi.stubEnv("VITE_ALUMIA_AI_URL", "https://alumia-ai.example");
    mockedGetSession.mockResolvedValue({
      data: { session: { access_token: "jwt-valid" } },
      error: null,
    } as Awaited<ReturnType<typeof supabase.auth.getSession>>);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      mode: "proposal",
      message: "Preparei uma tarefa para você revisar.",
      proposal: {
        id: "20a0db9d-f122-4c3d-b93d-e983c830c205",
        type: "create_task",
        title: "Pagar a conta",
        date: "2026-09-28",
        priority: "alta",
        reminder: null,
      },
    }), { status: 200 })));

    const result = await respondToAlumia("Preciso pagar a conta amanhã e é importante");

    expect(result.source).toBe("generative");
    expect(result.proposedAction).toMatchObject({
      title: "Pagar a conta",
      date: "2026-09-28",
      priority: "alta",
    });
    expect(mockedCreateTask).not.toHaveBeenCalled();
  });

  it("envia somente o resumo financeiro agregado quando há consentimento", async () => {
    vi.stubEnv("VITE_ENABLE_ALUMIA_AI_GENERATIVE", "true");
    vi.stubEnv("VITE_ALUMIA_AI_URL", "https://alumia-ai.example");
    vi.mocked(getAlumiaFinanceContextPreference).mockResolvedValue(true);
    vi.mocked(getFinanceDashboardData).mockResolvedValue({
      transactions: [
        { id: "1", title: "Salário confidencial", category: "Trabalho", amount: 5000, currency: "BRL", kind: "income", occurredAt: new Date().toISOString(), source: "manual" },
        { id: "2", title: "Loja confidencial", category: "Casa", amount: 500, currency: "BRL", kind: "expense", occurredAt: new Date().toISOString(), source: "manual" },
      ],
      obligations: [],
      goals: [],
    });
    mockedGetSession.mockResolvedValue({ data: { session: { access_token: "jwt-valid" } }, error: null } as Awaited<ReturnType<typeof supabase.auth.getSession>>);
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ mode: "generative", message: "Seu saldo está positivo." })));
    vi.stubGlobal("fetch", fetchMock);

    await respondToAlumia("Como estão minhas finanças?");

    const body = JSON.parse(String(fetchMock.mock.calls[0][1].body));
    expect(body.context.finance).toMatchObject({ income: 5000, expenses: 500, balance: 4500 });
    expect(JSON.stringify(body.context.finance)).not.toContain("Salário confidencial");
    expect(JSON.stringify(body.context.finance)).not.toContain("Loja confidencial");
  });

  it("apresenta discretamente uma lembrança já gravada pelo serviço autorizado", async () => {
    vi.stubEnv("VITE_ENABLE_ALUMIA_AI_GENERATIVE", "true");
    vi.stubEnv("VITE_ALUMIA_AI_URL", "https://alumia-ai.example");
    mockedGetSession.mockResolvedValue({
      data: { session: { access_token: "jwt-valid" } }, error: null,
    } as Awaited<ReturnType<typeof supabase.auth.getSession>>);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      mode: "memory_learned",
      message: "Vou lembrar que gosta de beach tênis.",
      learnedMemory: { content: "Gosta de beach tênis" },
    }), { status: 200 })));

    const result = await respondToAlumia("Eu gosto de beach tênis");

    expect(result.learnedMemory).toEqual({ content: "Gosta de beach tênis" });
    expect(result.text).toContain("Vou lembrar");
  });

  it.each([null, false, "failure"] as const)("não transmite histórico quando a autorização é %s", async (preference) => {
    vi.stubEnv("VITE_ENABLE_ALUMIA_AI_GENERATIVE", "true");
    vi.stubEnv("VITE_ALUMIA_AI_URL", "https://alumia-ai.example");
    if (preference === "failure") vi.mocked(getAlumiaContextPreference).mockRejectedValue(new Error("offline"));
    else vi.mocked(getAlumiaContextPreference).mockResolvedValue(preference);
    mockedGetSession.mockResolvedValue({ data: { session: { access_token: "jwt-valid" } }, error: null } as Awaited<ReturnType<typeof supabase.auth.getSession>>);
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ mode: "generative", message: "Bom dia! Qual tarefa?" })));
    vi.stubGlobal("fetch", fetchMock);
    await respondToAlumia("Oi, queria criar uma tarefa", [{ id: "old", role: "user", text: "Mensagem anterior" }]);
    expect(JSON.parse(String(fetchMock.mock.calls[0][1].body)).history).toEqual([]);
    expect(mockedGetTasks).not.toHaveBeenCalled();
    expect(mockedCreateTask).not.toHaveBeenCalled();
  });

  it("envia o áudio bruto autenticado para transcrição", async () => {
    vi.stubEnv("VITE_ENABLE_ALUMIA_AI_GENERATIVE", "true");
    vi.stubEnv("VITE_ALUMIA_AI_URL", "https://alumia-ai.example");
    mockedGetSession.mockResolvedValue({ data: { session: { access_token: "jwt-valid" } }, error: null } as Awaited<ReturnType<typeof supabase.auth.getSession>>);
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ transcript: "Olá, Alumia." })));
    vi.stubGlobal("fetch", fetchMock);
    const audio = new Blob(["audio"], { type: "audio/webm" });

    await expect(transcribeAlumiaAudio(audio)).resolves.toBe("Olá, Alumia.");
    expect(fetchMock).toHaveBeenCalledWith("https://alumia-ai.example/v1/transcriptions", expect.objectContaining({
      method: "POST",
      body: audio,
      headers: expect.objectContaining({ authorization: "Bearer jwt-valid", "content-type": "audio/webm" }),
    }));
  });

  it("recebe a voz sintetizada da resposta como áudio", async () => {
    vi.stubEnv("VITE_ENABLE_ALUMIA_AI_GENERATIVE", "true");
    vi.stubEnv("VITE_ALUMIA_AI_URL", "https://alumia-ai.example");
    mockedGetSession.mockResolvedValue({ data: { session: { access_token: "jwt-valid" } }, error: null } as Awaited<ReturnType<typeof supabase.auth.getSession>>);
    const fetchMock = vi.fn().mockResolvedValue(new Response("mp3", { headers: { "content-type": "audio/mpeg" } }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await synthesizeAlumiaSpeech("Estou aqui com você.");
    expect(result.type).toBe("audio/mpeg");
    expect(fetchMock).toHaveBeenCalledWith("https://alumia-ai.example/v1/speech", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ text: "Estou aqui com você." }),
    }));
  });
});
