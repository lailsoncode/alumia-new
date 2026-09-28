export type FinanceTransactionKind = "income" | "expense";
export type FinanceObligationKind = "bill" | "debt";
export type FinanceObligationStatus = "pending" | "paid" | "cancelled";

export interface FinanceTransaction {
  id: string;
  title: string;
  category: string | null;
  amount: number;
  currency: string;
  kind: FinanceTransactionKind;
  occurredAt: string;
  source: "manual" | "obligation" | "goal";
}

export interface FinanceObligation {
  id: string;
  title: string;
  kind: FinanceObligationKind;
  amount: number;
  currency: string;
  dueDate: string;
  status: FinanceObligationStatus;
  paidAt: string | null;
  installmentNumber: number | null;
  installmentTotal: number | null;
}

export interface FinanceGoal {
  id: string;
  title: string;
  note: string | null;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate: string | null;
  status: "active" | "completed" | "archived";
}

export interface FinanceDashboardData {
  transactions: FinanceTransaction[];
  obligations: FinanceObligation[];
  goals: FinanceGoal[];
}

export interface CreateFinanceTransactionInput {
  title: string;
  category?: string;
  amount: number;
  kind: FinanceTransactionKind;
  occurredAt?: string;
}

export interface CreateFinanceObligationInput {
  title: string;
  kind: FinanceObligationKind;
  amount: number;
  dueDate: string;
}

export interface CreateFinanceGoalInput {
  title: string;
  note?: string;
  targetAmount: number;
  targetDate?: string;
}
