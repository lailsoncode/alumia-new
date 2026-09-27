import { describe, expect, it } from "vitest";
import { classifyAlumiaIntent, extractTaskTitle, hasPossibleCrisisSignal, normalizeAlumiaText } from "./alumia-ai";

describe("Alum.IA intent rules", () => {
  it("normaliza acentos e espaços sem alterar o texto original", () => {
    expect(normalizeAlumiaText("  Respiração   breve ")).toBe("respiracao breve");
  });

  it("prioriza um possível sinal de crise sobre ferramentas", () => {
    expect(classifyAlumiaIntent("Quero morrer e apagar minhas tarefas")).toBe("crisis");
    expect(hasPossibleCrisisSignal("Não quero viver assim")).toBe(true);
  });

  it("extrai uma proposta de tarefa sem executá-la", () => {
    expect(extractTaskTitle("Crie uma tarefa: comprar pão.")) .toBe("comprar pão");
    expect(classifyAlumiaIntent("adicione uma tarefa ligar para Ana")).toBe("create_task");
  });

  it("reconhece consultas de tarefas e mindfulness", () => {
    expect(classifyAlumiaIntent("Quais são minhas prioridades?")) .toBe("tasks");
    expect(classifyAlumiaIntent("Quero uma pausa para respirar")) .toBe("mindfulness");
  });

  it("usa capacidades como resposta segura para texto não reconhecido", () => {
    expect(classifyAlumiaIntent("Como você pode me ajudar?")) .toBe("capabilities");
  });
});
