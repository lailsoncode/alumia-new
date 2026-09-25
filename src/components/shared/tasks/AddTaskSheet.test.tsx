import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
});
