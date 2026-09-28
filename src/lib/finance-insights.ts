import type { FinanceAIContext, FinanceDashboardData, FinanceSummary, FinanceTransaction } from "@/types";

const DAY_MS = 86_400_000;

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function belongsToMonth(iso: string, date: Date) {
  const value = new Date(iso);
  return value.getFullYear() === date.getFullYear() && value.getMonth() === date.getMonth();
}

function transactionTotals(transactions: FinanceTransaction[]) {
  return transactions.reduce((totals, transaction) => {
    totals[transaction.kind] += transaction.amount;
    return totals;
  }, { income: 0, expense: 0 });
}

export function calculateFinanceSummary(data: FinanceDashboardData, now = new Date()): FinanceSummary {
  const currentTransactions = data.transactions.filter((item) => belongsToMonth(item.occurredAt, now));
  const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousTransactions = data.transactions.filter((item) => belongsToMonth(item.occurredAt, previousDate));
  const current = transactionTotals(currentTransactions);
  const previous = transactionTotals(previousTransactions);
  const balance = current.income - current.expense;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const elapsedDays = Math.max(1, Math.min(now.getDate(), daysInMonth));
  const hasEnoughProjectionData = elapsedDays >= 3 && currentTransactions.length >= 2;
  const averageDailyExpenses = current.expense / elapsedDays;
  const projectedExpenses = averageDailyExpenses * daysInMonth;
  const projectedBalance = current.income - projectedExpenses;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const soon = today + 7 * DAY_MS;
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime();
  const pending = data.obligations.filter((item) => item.status === "pending");
  const pendingInCycle = pending.filter((item) => new Date(`${item.dueDate}T00:00:00`).getTime() <= monthEnd);
  const pendingAmount = pendingInCycle.reduce((sum, item) => sum + item.amount, 0);
  const categories = currentTransactions
    .filter((item) => item.kind === "expense")
    .reduce((totals, item) => {
      const category = item.category?.trim() || "Sem categoria";
      totals.set(category, (totals.get(category) ?? 0) + item.amount);
      return totals;
    }, new Map<string, number>());
  const topCategories = [...categories.entries()]
    .map(([category, amount]) => ({ category, amount, share: current.expense ? amount / current.expense : 0 }))
    .sort((first, second) => second.amount - first.amount)
    .slice(0, 5);
  const activeGoals = data.goals.filter((goal) => goal.status === "active");

  return {
    period: monthKey(now),
    income: current.income,
    expenses: current.expense,
    balance,
    savingsRate: current.income > 0 ? (balance / current.income) * 100 : null,
    previousBalance: previous.income - previous.expense,
    expenseChangePercent: previous.expense > 0 ? ((current.expense - previous.expense) / previous.expense) * 100 : null,
    averageDailyExpenses,
    projectedExpenses,
    projectedBalance,
    pendingCount: pendingInCycle.length,
    pendingAmount,
    availableAfterPending: balance - pendingAmount,
    overdueCount: pending.filter((item) => new Date(`${item.dueDate}T00:00:00`).getTime() < today).length,
    dueSoonCount: pending.filter((item) => {
      const due = new Date(`${item.dueDate}T00:00:00`).getTime();
      return due >= today && due <= soon;
    }).length,
    activeGoalsAmount: activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0),
    activeGoalsTarget: activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0),
    topCategories,
    hasEnoughProjectionData,
  };
}

export function createFinanceAIContext(data: FinanceDashboardData, now = new Date()): FinanceAIContext {
  const summary = calculateFinanceSummary(data, now);
  return {
    period: summary.period,
    currency: "BRL",
    income: summary.income,
    expenses: summary.expenses,
    balance: summary.balance,
    savingsRate: summary.savingsRate === null ? null : Math.round(summary.savingsRate * 10) / 10,
    projectedExpenses: summary.hasEnoughProjectionData ? Math.round(summary.projectedExpenses * 100) / 100 : null,
    projectedBalance: summary.hasEnoughProjectionData ? Math.round(summary.projectedBalance * 100) / 100 : null,
    pendingObligations: {
      count: summary.pendingCount,
      amount: summary.pendingAmount,
      overdueCount: summary.overdueCount,
      dueSoonCount: summary.dueSoonCount,
    },
    goals: {
      activeCount: data.goals.filter((goal) => goal.status === "active").length,
      savedAmount: summary.activeGoalsAmount,
      targetAmount: summary.activeGoalsTarget,
    },
    topExpenseCategories: summary.topCategories.slice(0, 3).map(({ category, amount }) => ({ category, amount })),
  };
}
