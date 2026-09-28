import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AddTaskSheet } from "./AddTaskSheet";

describe("AddTaskSheet", () => {
  it("solicita data e horário antes de mostrar as opções de lembrete", () => {
    render(<AddTaskSheet open onClose={() => undefined} />);

    fireEvent.click(screen.getByRole("button", { name: "Definir lembrete" }));

    expect(screen.getByRole("dialog", { name: "Data e horário" })).toBeInTheDocument();
    expect(screen.getByText("(obrigatório para o lembrete)")).toBeInTheDocument();

    const applyButton = screen.getByRole("button", { name: "Aplicar" });
    expect(applyButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/Horário/), { target: { value: "13:00" } });
    expect(applyButton).toBeEnabled();
    fireEvent.click(applyButton);

    expect(screen.getByRole("group", { name: "Momento do lembrete" })).toBeInTheDocument();
  });

  it("cria uma recorrência semanal com múltiplos dias", async () => {
    const onSave = vi.fn();
    render(<AddTaskSheet open onClose={() => undefined} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Caminhar" } });
    fireEvent.click(screen.getByRole("button", { name: "Definir data e horário" }));
    fireEvent.click(screen.getByRole("switch", { name: "Repetir tarefa" }));
    fireEvent.click(screen.getByRole("button", { name: "Dias da semana" }));
    const tuesday = screen.getByRole("button", { name: "terça" });
    const thursday = screen.getByRole("button", { name: "quinta" });
    if (tuesday.getAttribute("aria-pressed") !== "true") fireEvent.click(tuesday);
    if (thursday.getAttribute("aria-pressed") !== "true") fireEvent.click(thursday);
    fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));
    fireEvent.click(screen.getByRole("button", { name: /Salvar tarefa/ }));

    await vi.waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0].recurrence).toMatchObject({
      frequency: "weekly",
      weekdays: expect.arrayContaining([2, 4]),
    });
  });

  it("preserva o rascunho quando o salvamento falha", async () => {
    render(<AddTaskSheet open onClose={() => undefined} onSave={() => Promise.reject(new Error("offline"))} />);

    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Respirar" } });
    fireEvent.click(screen.getByRole("button", { name: /Salvar tarefa/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Seu rascunho continua aqui");
    expect(screen.getByLabelText("Título")).toHaveValue("Respirar");
  });

  it("preenche os dados existentes ao editar uma tarefa recorrente", () => {
    render(
      <AddTaskSheet
        open
        title="Editar tarefa"
        initialTitle="Alongar"
        initialRecurrence={{ frequency: "daily" }}
        onClose={() => undefined}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Editar tarefa" })).toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toHaveValue("Alongar");
    expect(screen.getByText("Todos os dias")).toBeInTheDocument();
  });
});
