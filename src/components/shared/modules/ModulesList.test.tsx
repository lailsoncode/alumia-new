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

    expect(screen.getByRole("button", { name: "Abrir tarefas" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Abrir hidratação" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: /check-in emocional/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /mindfulness/i })).not.toBeInTheDocument();
    expect(screen.getAllByText("Em breve")).toHaveLength(3);
  });

  it("navega para um módulo ativo", () => {
    render(<ModulesList />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir tarefas" }));
    expect(navigate).toHaveBeenCalledWith({ to: "/tarefas" });
  });
});
