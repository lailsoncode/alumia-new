import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AlumiaChat } from "./AlumiaChat";
import { confirmAlumiaAction, respondToAlumia } from "@/services/alumiaAIService";

const navigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
}));

vi.mock("@/services/alumiaAIService", () => ({
  confirmAlumiaAction: vi.fn(),
  isAlumiaGenerativeEnabled: vi.fn(() => false),
  respondToAlumia: vi.fn(),
  synthesizeAlumiaSpeech: vi.fn(),
  transcribeAlumiaAudio: vi.fn(),
}));

const mockedRespond = vi.mocked(respondToAlumia);
const mockedConfirm = vi.mocked(confirmAlumiaAction);

describe("Alum.IA chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("explica a privacidade da prévia antes da primeira mensagem", () => {
    render(<AlumiaChat />);

    expect(screen.getByText(/mensagens não são salvas nem enviadas/i)).toBeInTheDocument();
    expect(screen.getByText(/nenhuma ação acontece sem você confirmar/i)).toBeInTheDocument();
  });

  it("exige confirmação antes de executar uma tarefa proposta", async () => {
    mockedRespond.mockResolvedValue({
      text: "Posso criar esta tarefa para você.",
      tone: "default",
      source: "editorial",
      proposedAction: {
        id: "action-1",
        type: "create_task",
        title: "comprar pão",
        priority: null,
        reminder: null,
      },
    });
    mockedConfirm.mockResolvedValue({ id: "task-1", title: "comprar pão" });
    render(<AlumiaChat />);

    fireEvent.change(screen.getByLabelText("Mensagem para a Alum.IA"), { target: { value: "Crie uma tarefa comprar pão" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));

    expect(await screen.findByText("Criar tarefa: comprar pão")).toBeInTheDocument();
    expect(mockedConfirm).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Criar tarefa" }));
    await waitFor(() => expect(mockedConfirm).toHaveBeenCalledWith({
      id: "action-1",
      type: "create_task",
      title: "comprar pão",
      priority: null,
      reminder: null,
    }));
    expect(await screen.findByText("Tarefa criada")).toBeInTheDocument();
  });

  it("permite revisar uma proposta generativa antes da confirmação", async () => {
    mockedRespond.mockResolvedValue({
      text: "Preparei uma tarefa para você revisar.",
      tone: "default",
      source: "generative",
      proposedAction: {
        id: "action-2",
        type: "create_task",
        title: "Pagar a conta",
        date: "2026-09-28",
        time: "14:30",
        priority: "alta",
        reminder: null,
      },
    });
    mockedConfirm.mockResolvedValue({ id: "task-2", title: "Pagar a conta" });
    render(<AlumiaChat />);

    fireEvent.change(screen.getByLabelText("Mensagem para a Alum.IA"), { target: { value: "Tenho que pagar a conta amanhã" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));

    expect(await screen.findByText("28/09/2026")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Revisar detalhes" }));
    expect(screen.getByDisplayValue("Pagar a conta")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Confirmar e criar/i })).toBeInTheDocument();
  });

  it("limpa a conversa local e restaura a apresentação inicial", async () => {
    mockedRespond.mockResolvedValue({ text: "Uma resposta breve.", tone: "default", source: "editorial" });
    render(<AlumiaChat />);

    fireEvent.change(screen.getByLabelText("Mensagem para a Alum.IA"), { target: { value: "Quero conversar um pouco" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));
    expect(await screen.findByText("Uma resposta breve.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Limpar conversa atual" }));
    expect(screen.queryByText("Uma resposta breve.")).not.toBeInTheDocument();
    expect(screen.getByText(/Oi, eu sou a Alum\.IA/i)).toBeInTheDocument();
  });

  it("mantém a entrada da conversa aberta, sem atalhos que direcionem o assunto", () => {
    render(<AlumiaChat />);

    expect(screen.queryByLabelText("Sugestões de mensagem")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Mensagem para a Alum.IA")).toHaveAttribute(
      "placeholder",
      "Escreva o que faria diferença agora…",
    );
  });

  it("continua automaticamente uma mensagem iniciada no balão flutuante", async () => {
    mockedRespond.mockResolvedValue({ text: "Vamos cuidar disso juntas.", tone: "default", source: "editorial" });

    render(<AlumiaChat initialMessage="Crie uma tarefa para beber água" />);

    expect(await screen.findByText("Crie uma tarefa para beber água")).toBeInTheDocument();
    await waitFor(() => expect(mockedRespond).toHaveBeenCalledWith(
      "Crie uma tarefa para beber água",
      expect.any(Array),
    ));
    expect(await screen.findByText("Vamos cuidar disso juntas.")).toBeInTheDocument();
  });

  it("acompanha o envio e a nova resposta até o fim da conversa", async () => {
    let finishResponse!: (value: Awaited<ReturnType<typeof respondToAlumia>>) => void;
    mockedRespond.mockImplementation(() => new Promise((resolve) => {
      finishResponse = resolve;
    }));
    const scrollIntoView = vi.mocked(window.HTMLElement.prototype.scrollIntoView);
    render(<AlumiaChat />);
    scrollIntoView.mockClear();

    fireEvent.change(screen.getByLabelText("Mensagem para a Alum.IA"), { target: { value: "Quero conversar" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar mensagem" }));

    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "end" }));
    const callsAfterSending = scrollIntoView.mock.calls.length;

    finishResponse({ text: "Estou aqui com você.", tone: "default", source: "generative" });
    expect(await screen.findByText("Estou aqui com você.")).toBeInTheDocument();
    await waitFor(() => expect(scrollIntoView.mock.calls.length).toBeGreaterThan(callsAfterSending));
  });
});
