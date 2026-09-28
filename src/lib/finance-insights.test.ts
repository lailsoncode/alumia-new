import { describe, expect, it } from "vitest";
import { calculateFinanceSummary, createFinanceAIContext } from "./finance-insights";
import type { FinanceDashboardData } from "@/types";

const data: FinanceDashboardData = {
  transactions: [
    { id: "1", title: "Receita", category: "Trabalho", amount: 5000, currency: "BRL", kind: "income", occurredAt: "2026-09-02T12:00:00Z", source: "manual" },
    { id: "2", title: "Mercado", category: "Alimentação", amount: 600, currency: "BRL", kind: "expense", occurredAt: "2026-09-05T12:00:00Z", source: "manual" },
    { id: "3", title: "Aluguel", category: "Casa", amount: 1400, currency: "BRL", kind: "expense", occurredAt: "2026-09-08T12:00:00Z", source: "manual" },
    { id: "4", title: "Anterior", category: "Casa", amount: 1000, currency: "BRL", kind: "expense", occurredAt: "2026-08-08T12:00:00Z", source: "manual" },
  ],
  obligations: [
    { id: "o1", title: "Energia", kind: "bill", amount: 300, currency: "BRL", dueDate: "2026-09-30", status: "pending", paidAt: null, installmentNumber: null, installmentTotal: null },
    { id: "o2", title: "Atrasada", kind: "debt", amount: 200, currency: "BRL", dueDate: "2026-09-20", status: "pending", paidAt: null, installmentNumber: null, installmentTotal: null },
  ],
  goals: [{ id: "g1", title: "Reserva", note: null, targetAmount: 3000, currentAmount: 900, currency: "BRL", targetDate: null, status: "active" }],
};

describe("finance insights", () => {
  it("calcula saldo, compromissos, tendência e projeção a partir da mesma fonte", () => {
    const summary = calculateFinanceSummary(data, new Date(2026, 8, 28, 12));
    expect(summary).toMatchObject({ income: 5000, expenses: 2000, balance: 3000, savingsRate: 60, pendingAmount: 500, availableAfterPending: 2500, overdueCount: 1, dueSoonCount: 1 });
    expect(summary.expenseChangePercent).toBe(100);
    expect(summary.projectedExpenses).toBeCloseTo(2142.86, 1);
    expect(summary.topCategories[0]).toMatchObject({ category: "Casa", amount: 1400 });
  });

  it("não inclui títulos individuais no contexto enviado à IA", () => {
    const context = createFinanceAIContext(data, new Date(2026, 8, 28, 12));
    expect(context).toMatchObject({ period: "2026-09", income: 5000, expenses: 2000, balance: 3000 });
    expect(JSON.stringify(context)).not.toContain("Mercado");
    expect(JSON.stringify(context)).not.toContain("Atrasada");
  });
});
