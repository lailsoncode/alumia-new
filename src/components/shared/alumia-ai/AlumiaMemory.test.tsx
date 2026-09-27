import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { AlumiaMemory } from "./AlumiaMemory";
import { forgetAllMemories, forgetMemory, getMemoryEnabled, getMemories, saveMemory, setMemoryEnabled } from "@/services/alumiaMemoryService";
vi.mock("@/services/alumiaMemoryService", () => ({ forgetAllMemories: vi.fn(), forgetMemory: vi.fn(), getMemoryEnabled: vi.fn(), getMemories: vi.fn(), saveMemory: vi.fn(), setMemoryEnabled: vi.fn() }));
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getMemoryEnabled).mockResolvedValue(false);
  vi.mocked(getMemories).mockResolvedValue([{ id: "1", content: "Aprende inglês", updated_at: "2026-09-27", source: "user_confirmed" }]);
});
it("memória começa desligada e esquecer exige confirmar mesmo desativada", async () => {
  render(<AlumiaMemory settings />);
  fireEvent.click(screen.getByRole("button", { name: /Aprendizado da Alum\.IA/ }));
  await screen.findByText("Aprende inglês");
  expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  fireEvent.click(screen.getByRole("button", { name: "Esquecer" }));
  expect(forgetMemory).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
  await waitFor(() => expect(forgetMemory).toHaveBeenCalledWith("1"));
});
it("desativar preserva a lista e não exclui lembranças", async () => {
  vi.mocked(getMemoryEnabled).mockResolvedValue(true);
  render(<AlumiaMemory settings />);
  fireEvent.click(screen.getByRole("button", { name: /Aprendizado da Alum\.IA/ }));
  await screen.findByText("Aprende inglês");
  fireEvent.click(screen.getByRole("switch"));
  await waitFor(() => expect(setMemoryEnabled).toHaveBeenCalledWith(false));
  expect(forgetMemory).not.toHaveBeenCalled();
  expect(screen.getByText("Aprende inglês")).toBeInTheDocument();
});
it("apaga todas as lembranças somente após confirmação", async () => {
  render(<AlumiaMemory settings />);
  fireEvent.click(screen.getByRole("button", { name: /Aprendizado da Alum\.IA/ }));
  await screen.findByText("Aprende inglês");
  fireEvent.click(screen.getByRole("button", { name: "Apagar todas as lembranças" }));
  expect(forgetAllMemories).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Confirmar exclusão de todas" }));
  await waitFor(() => expect(forgetAllMemories).toHaveBeenCalledOnce());
  expect(screen.queryByText("Aprende inglês")).not.toBeInTheDocument();
});
