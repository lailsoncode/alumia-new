import { supabase } from "@/lib/supabaseClient";
import type {
  CreateFinanceGoalInput,
  CreateFinanceObligationInput,
  CreateFinanceTransactionInput,
  FinanceDashboardData,
  FinanceGoal,
  FinanceObligation,
  FinanceTransaction,
} from "@/types";

async function authenticatedUserId() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session?.user) throw new Error("Usuário não autenticado.");
  return data.session.user.id;
}

function numberValue(value: number | string) {
  return typeof value === "number" ? value : Number(value);
}

export async function getFinanceDashboardData(): Promise<FinanceDashboardData> {
  const userId = await authenticatedUserId();
  const [transactionsResult, obligationsResult, goalsResult] = await Promise.all([
    supabase
      .from("finance_transactions")
      .select("id, title, category, amount, currency, kind, occurred_at, source")
      .eq("user_id", userId)
      .order("occurred_at", { ascending: false })
      .limit(200),
    supabase
      .from("finance_obligations")
      .select("id, title, kind, amount, currency, due_date, status, paid_at, installment_number, installment_total")
      .eq("user_id", userId)
      .neq("status", "cancelled")
      .order("due_date", { ascending: true }),
    supabase
      .from("finance_goal_balances")
      .select("id, title, note, target_amount, current_amount, currency, target_date, status")
      .eq("user_id", userId)
      .neq("status", "archived")
      .order("created_at", { ascending: false }),
  ]);

  if (transactionsResult.error) throw transactionsResult.error;
  if (obligationsResult.error) throw obligationsResult.error;
  if (goalsResult.error) throw goalsResult.error;

  const transactions: FinanceTransaction[] = (transactionsResult.data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    amount: numberValue(row.amount),
    currency: row.currency,
    kind: row.kind as FinanceTransaction["kind"],
    occurredAt: row.occurred_at,
    source: row.source as FinanceTransaction["source"],
  }));
  const obligations: FinanceObligation[] = (obligationsResult.data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    kind: row.kind as FinanceObligation["kind"],
    amount: numberValue(row.amount),
    currency: row.currency,
    dueDate: row.due_date,
    status: row.status as FinanceObligation["status"],
    paidAt: row.paid_at,
    installmentNumber: row.installment_number,
    installmentTotal: row.installment_total,
  }));
  const goals: FinanceGoal[] = (goalsResult.data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    note: row.note,
    targetAmount: numberValue(row.target_amount),
    currentAmount: numberValue(row.current_amount),
    currency: row.currency,
    targetDate: row.target_date,
    status: row.status as FinanceGoal["status"],
  }));
  return { transactions, obligations, goals };
}

export async function createFinanceTransaction(input: CreateFinanceTransactionInput) {
  const userId = await authenticatedUserId();
  const { error } = await supabase.from("finance_transactions").insert({
    user_id: userId,
    title: input.title.trim(),
    category: input.category?.trim() || null,
    amount: input.amount,
    kind: input.kind,
    occurred_at: input.occurredAt ?? new Date().toISOString(),
    source: "manual",
  });
  if (error) throw error;
}

export async function createFinanceObligation(input: CreateFinanceObligationInput) {
  const userId = await authenticatedUserId();
  const { error } = await supabase.from("finance_obligations").insert({
    user_id: userId,
    title: input.title.trim(),
    kind: input.kind,
    amount: input.amount,
    due_date: input.dueDate,
  });
  if (error) throw error;
}

export async function payFinanceObligation(obligationId: string) {
  await authenticatedUserId();
  const { error } = await supabase.rpc("pay_finance_obligation", { p_obligation_id: obligationId });
  if (error) throw error;
}

export async function createFinanceGoal(input: CreateFinanceGoalInput) {
  const userId = await authenticatedUserId();
  const { error } = await supabase.from("finance_goals").insert({
    user_id: userId,
    title: input.title.trim(),
    note: input.note?.trim() || null,
    target_amount: input.targetAmount,
    target_date: input.targetDate || null,
  });
  if (error) throw error;
}

export async function addFinanceGoalContribution(goalId: string, amount: number) {
  await authenticatedUserId();
  const { error } = await supabase.rpc("record_finance_goal_contribution", {
    p_goal_id: goalId,
    p_amount: amount,
    p_kind: "deposit",
  });
  if (error) throw error;
}
