import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { AlumiaLearningOnboarding } from "./AlumiaLearningOnboarding";
import { completeLearningOnboarding, getLearningPreference, setMemoryEnabled } from "@/services/alumiaMemoryService";

vi.mock("@/services/alumiaMemoryService", () => ({
  completeLearningOnboarding: vi.fn(),
  getLearningPreference: vi.fn(),
  setMemoryEnabled: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getLearningPreference).mockResolvedValue({ enabled: false, decided: false, onboardingCompleted: false });
});

it("pede autorização antes de iniciar as perguntas e permite recusar", async () => {
  render(<AlumiaLearningOnboarding />);
  expect(await screen.findByText("Posso aprender com você?")).toBeInTheDocument();
  expect(completeLearningOnboarding).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Agora não" }));
  await waitFor(() => expect(setMemoryEnabled).toHaveBeenCalledWith(false));
});

it("forma um perfil inicial somente depois da revisão", async () => {
  render(<AlumiaLearningOnboarding />);
  fireEvent.click(await screen.findByRole("button", { name: "Permitir e começar" }));
  await screen.findByText("O que mais importa para você neste momento?");
  expect(setMemoryEnabled).toHaveBeenCalledWith(true);

  const responses = ["Ter mais tempo com minha família", "Aprender inglês", "Conversando com calma", "Cobranças e pressão"];
  for (const [index, response] of responses.entries()) {
    fireEvent.change(screen.getByLabelText("Sua resposta"), { target: { value: response } });
    fireEvent.click(screen.getByRole("button", { name: index === responses.length - 1 ? "Revisar" : "Continuar" }));
  }

  expect(screen.getByText("Foi isso que entendi sobre você")).toBeInTheDocument();
  expect(completeLearningOnboarding).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Salvar meu perfil" }));
  await waitFor(() => expect(completeLearningOnboarding).toHaveBeenCalledWith([
    "Prioridade atual: Ter mais tempo com minha família",
    "Objetivo atual: Aprender inglês",
    "Forma de apoio preferida: Conversando com calma",
    "Prefere evitar: Cobranças e pressão",
  ]));
});

it("não reaparece depois de uma decisão concluída", async () => {
  vi.mocked(getLearningPreference).mockResolvedValue({ enabled: true, decided: true, onboardingCompleted: true });
  render(<AlumiaLearningOnboarding />);
  await waitFor(() => expect(getLearningPreference).toHaveBeenCalled());
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
