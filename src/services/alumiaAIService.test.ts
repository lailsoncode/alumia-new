import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { confirmAlumiaAction, respondToAlumia } from "./alumiaAIService";
import { createTask, getTasks } from "./tasksService";
import { getMindfulnessPractices } from "./mindfulnessService";
import { supabase } from "@/lib/supabaseClient";

vi.mock("./tasksService", () => ({
  createTask: vi.fn(),
  getTasks: vi.fn(),
}));

vi.mock("./mindfulnessService", () => ({
  getMindfulnessPractices: vi.fn(),
}));

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

    await confirmAlumiaAction({ id: "action-1", type: "create_task", title: "comprar pão" });

    expect(mockedCreateTask).toHaveBeenCalledWith({
      title: "comprar pão",
      priority: null,
      reminder: null,
      moduleKey: "alumia_ai",
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
  });
});
