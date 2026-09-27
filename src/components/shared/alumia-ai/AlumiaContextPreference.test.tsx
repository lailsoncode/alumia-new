import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { AlumiaContextPreference } from "./AlumiaContextPreference";
import { getAlumiaContextPreference, setAlumiaContextPreference } from "@/services/alumiaPreferencesService";
vi.mock("@/services/alumiaPreferencesService", () => ({ getAlumiaContextPreference: vi.fn(), setAlumiaContextPreference: vi.fn() }));
beforeEach(() => { vi.resetAllMocks(); });
it("pede autorização sem ativar automaticamente e permite recusar", async () => {
  vi.mocked(getAlumiaContextPreference).mockResolvedValue(null);
  render(<AlumiaContextPreference />);
  fireEvent.click(await screen.findByRole("button", { name: "Continuar sem contexto" }));
  await waitFor(() => expect(setAlumiaContextPreference).toHaveBeenCalledWith(false));
});
it("permite revogar em Ajustes", async () => {
  vi.mocked(getAlumiaContextPreference).mockResolvedValue(true);
  render(<AlumiaContextPreference settings />);
  const toggle = await screen.findByRole("switch");
  expect(toggle).toHaveAttribute("aria-checked", "true");
  fireEvent.click(toggle);
  await waitFor(() => expect(toggle).toHaveAttribute("aria-checked", "false"));
  expect(setAlumiaContextPreference).toHaveBeenCalledWith(false);
});
it("não mostra autorização como salva quando a gravação falha", async () => {
  vi.mocked(getAlumiaContextPreference).mockResolvedValue(null);
  vi.mocked(setAlumiaContextPreference).mockRejectedValue(new Error("offline"));
  render(<AlumiaContextPreference />);
  fireEvent.click(await screen.findByRole("button", { name: "Permitir contexto" }));
  expect(await screen.findByRole("alert")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Permitir contexto" })).toBeInTheDocument();
});
