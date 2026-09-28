import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TaskItem } from "./TaskItem";

describe("TaskItem", () => {
  it("preserva a cor do módulo de origem sem repetir nome e ícone", () => {
    render(
      <ul>
        <TaskItem task={{ id: "water-task", title: "Beber água", moduleKey: "hydration" }} />
      </ul>,
    );

    const item = screen.getByRole("listitem");
    expect(item).toHaveAttribute("data-module", "hydration");
    expect(item).toHaveClass("module-theme-hydration", "module-whisper");
    expect(item).not.toHaveClass("module-surface");
    expect(screen.queryByText("Hidratação")).not.toBeInTheDocument();
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

  it("oferece ações acessíveis para editar e excluir", () => {
    const task = { id: "editable-task", title: "Organizar a mesa" };
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<ul><TaskItem task={task} onEdit={onEdit} onDelete={onDelete} /></ul>);

    fireEvent.click(screen.getByRole("button", { name: "Editar Organizar a mesa" }));
    fireEvent.click(screen.getByRole("button", { name: "Excluir Organizar a mesa" }));

    expect(onEdit).toHaveBeenCalledWith(task);
    expect(onDelete).toHaveBeenCalledWith(task);
  });
});
