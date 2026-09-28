import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FloatingAlumia } from "./FloatingAlumia";

const navigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useLocation: () => ({ pathname: "/tarefas" }),
  useNavigate: () => navigate,
}));

vi.mock("./RiveAlumia", () => ({
  RiveAlumia: () => <div aria-hidden="true" />,
}));

describe("Alumia flutuante", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it("abre com atalhos rápidos sem focar a caixa de mensagem", async () => {
    render(<FloatingAlumia />);

    fireEvent.click(screen.getByRole("button", { name: "Conversar com a Alumia" }));

    expect(await screen.findByLabelText("Atalhos rápidos da Alumia")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Conversar comigo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cuidar de como me sinto/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText("Mensagem para a Alumia")).not.toHaveFocus());
  });

  it("leva o atalho principal para o chat sem abrir o teclado", async () => {
    render(<FloatingAlumia />);

    fireEvent.click(screen.getByRole("button", { name: "Conversar com a Alumia" }));
    fireEvent.click(await screen.findByRole("button", { name: /Conversar comigo/i }));

    expect(navigate).toHaveBeenCalledWith({ to: "/alumia" });
  });
});
