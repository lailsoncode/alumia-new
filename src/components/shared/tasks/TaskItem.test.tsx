import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TaskItem } from "./TaskItem";

describe("TaskItem", () => {
  it("preserva tema e identificação do módulo de origem", () => {
    render(
      <ul>
        <TaskItem task={{ id: "water-task", title: "Beber água", moduleKey: "hydration" }} />
      </ul>,
    );

    const item = screen.getByRole("listitem");
    expect(item).toHaveAttribute("data-module", "hydration");
    expect(item).toHaveClass("module-theme-hydration", "module-whisper");
    expect(item).not.toHaveClass("module-surface");
    expect(screen.getByText("Hidratação")).toBeInTheDocument();
  });

  it("explica quando uma tarefa foi reagendada automaticamente", () => {
    render(
      <ul>
        <TaskItem task={{ id: "moved-task", title: "Fazer uma pausa", date: "2026-09-27", last_postponed_from: "2026-09-26" }} />
      </ul>,
    );

    expect(screen.getByText(/Reagendada de 26 de set\./)).toBeInTheDocument();
  });

  it("usa apenas as cores da Alum.IA nas tarefas criadas pela conversa", () => {
    render(
      <ul>
        <TaskItem task={{ id: "alumia-task", title: "Separar documentos", moduleKey: "alumia_ai" }} />
      </ul>,
    );

    const item = screen.getByRole("listitem");
    expect(item).toHaveAttribute("data-module", "alumia_ai");
    expect(item).toHaveClass("module-theme-alumia-ai", "module-whisper");
    expect(screen.queryByText("Alum.IA")).not.toBeInTheDocument();
  });
});
