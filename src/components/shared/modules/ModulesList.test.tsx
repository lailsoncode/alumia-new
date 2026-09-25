import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ModulesList } from "./ModulesList";

const navigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
}));

describe("ModulesList", () => {
  beforeEach(() => navigate.mockClear());

  it("oferece somente os módulos funcionais como ações", () => {
    render(<ModulesList />);

    expect(screen.getByRole("button", { name: "Acessar tarefas" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Acessar hidratação" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Acessar check-in emocional" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: /mindfulness/i })).not.toBeInTheDocument();
    expect(screen.getAllByText("Em breve")).toHaveLength(3);
    expect(screen.getByRole("switch", { name: "Tarefas está ativo" })).toBeChecked();
    expect(screen.getByRole("switch", { name: "Tarefas está ativo" })).toBeDisabled();
    expect(screen.getByRole("switch", { name: "Check-in emocional está ativo" })).toBeChecked();
    expect(screen.getByRole("switch", { name: "Alum.IA estará disponível em breve" })).not.toBeChecked();
    expect(screen.getByRole("switch", { name: "Alum.IA estará disponível em breve" })).toBeDisabled();
  });

  it("navega para um módulo ativo", () => {
    render(<ModulesList />);
    fireEvent.click(screen.getByRole("button", { name: "Acessar tarefas" }));
    expect(navigate).toHaveBeenCalledWith({ to: "/tarefas" });
  });
});
