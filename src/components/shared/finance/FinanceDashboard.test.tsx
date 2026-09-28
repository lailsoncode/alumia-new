import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createFinanceObligation,
  createFinanceTransaction,
  getFinanceDashboardData,
} from "@/services/financeService";
import { FinanceDashboard } from "./FinanceDashboard";

vi.mock("@/services/financeService", () => ({
  addFinanceGoalContribution: vi.fn(),
  createFinanceGoal: vi.fn(),
  createFinanceObligation: vi.fn(),
  createFinanceTransaction: vi.fn(),
  getFinanceDashboardData: vi.fn(),
  payFinanceObligation: vi.fn(),
}));

const mockedLoad = vi.mocked(getFinanceDashboardData);
const mockedCreateTransaction = vi.mocked(createFinanceTransaction);
const mockedCreateObligation = vi.mocked(createFinanceObligation);

describe("FinanceDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedLoad.mockResolvedValue({ transactions: [], obligations: [], goals: [] });
  });

  it("começa vazio e não exibe os antigos dados demonstrativos", async () => {
    render(<FinanceDashboard />);

    expect(await screen.findByText(/ainda não há movimentos neste mês/i)).toBeInTheDocument();
    expect(screen.queryByText("Salário")).not.toBeInTheDocument();
    expect(screen.queryByText("Mercado do bairro")).not.toBeInTheDocument();
    expect(screen.queryByText("Reserva de tranquilidade")).not.toBeInTheDocument();
  });

  it("salva um movimento pelo serviço financeiro e recarrega os dados", async () => {
    render(<FinanceDashboard />);
    await screen.findByText(/ainda não há movimentos neste mês/i);

    fireEvent.click(screen.getByRole("button", { name: /novo lançamento/i }));
    fireEvent.change(screen.getByLabelText("Descrição"), { target: { value: "Freela" } });
    fireEvent.change(screen.getByLabelText("Categoria (opcional)"), { target: { value: "Trabalho" } });
    fireEvent.change(screen.getByLabelText("Valor"), { target: { value: "350,50" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrada" }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar movimento" }));

    await waitFor(() => expect(mockedCreateTransaction).toHaveBeenCalledWith({
      title: "Freela",
      category: "Trabalho",
      amount: 350.5,
      kind: "income",
    }));
    expect(mockedLoad).toHaveBeenCalledTimes(2);
  });

  it("permite cadastrar uma conta a partir do estado vazio", async () => {
    render(<FinanceDashboard />);
    await screen.findByText(/ainda não há movimentos neste mês/i);
    fireEvent.click(screen.getByRole("tab", { name: "Contas e dívidas" }));
    fireEvent.click(screen.getByRole("button", { name: "Adicionar uma conta" }));
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Energia" } });
    fireEvent.change(screen.getByLabelText("Valor"), { target: { value: "184,60" } });
    fireEvent.change(screen.getByLabelText("Vencimento"), { target: { value: "2026-10-10" } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    await waitFor(() => expect(mockedCreateObligation).toHaveBeenCalledWith({
      title: "Energia",
      amount: 184.6,
      dueDate: "2026-10-10",
      kind: "bill",
    }));
  });
});
