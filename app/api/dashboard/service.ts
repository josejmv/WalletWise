import { prisma } from "@/lib/prisma";
import type {
  DashboardKPIs,
  BalanceByAccount,
  BalanceByCurrency,
  ExpensesByCategory,
  MonthlyTrend,
  BudgetProgress,
  DashboardFilters,
  DashboardSummary,
  RecentTransaction,
} from "./types";

export async function getKPIs(
  filters?: DashboardFilters,
): Promise<DashboardKPIs> {
  const dateFilter = {
    ...(filters?.startDate && { gte: filters.startDate }),
    ...(filters?.endDate && { lte: filters.endDate }),
  };

  const [accounts, incomes, expenses, activeJobs, activeBudgets] =
    await Promise.all([
      prisma.account.findMany({ where: { isActive: true } }),
      prisma.income.findMany({
        where:
          Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined,
      }),
      prisma.expense.findMany({
        where:
          Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined,
      }),
      prisma.job.count({ where: { status: "active" } }),
      prisma.budget.count({ where: { status: "active" } }),
    ]);

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + Number(acc.balance),
    0,
  );
  const totalIncome = incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);
  const totalExpenses = expenses.reduce(
    (sum, exp) => sum + Number(exp.amount),
    0,
  );
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    activeAccounts: accounts.length,
    activeJobs,
    activeBudgets,
  };
}

export async function getBalanceByAccount(): Promise<BalanceByAccount[]> {
  const accounts = await prisma.account.findMany({
    where: { isActive: true },
    include: {
      accountType: true,
      currency: true,
    },
    orderBy: { balance: "desc" },
  });

  return accounts.map((account) => ({
    accountId: account.id,
    accountName: account.name,
    accountType: account.accountType.name,
    balance: Number(account.balance),
    currencyCode: account.currency.code,
  }));
}

export async function getBalanceByCurrency(): Promise<BalanceByCurrency[]> {
  const accounts = await prisma.account.findMany({
    where: { isActive: true },
    include: { currency: true },
  });

  const byCurrency = new Map<string, { currencyCode: string; total: number }>();

  for (const account of accounts) {
    const data = byCurrency.get(account.currencyId) || {
      currencyCode: account.currency.code,
      total: 0,
    };
    data.total += Number(account.balance);
    byCurrency.set(account.currencyId, data);
  }

  return Array.from(byCurrency.entries()).map(([currencyId, data]) => ({
    currencyId,
    currencyCode: data.currencyCode,
    totalBalance: data.total,
  }));
}

export async function getExpensesByCategory(
  filters?: DashboardFilters,
): Promise<ExpensesByCategory[]> {
  const dateFilter = {
    ...(filters?.startDate && { gte: filters.startDate }),
    ...(filters?.endDate && { lte: filters.endDate }),
  };

  const expenses = await prisma.expense.findMany({
    where:
      Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined,
    include: { category: true },
  });

  const byCategory = new Map<
    string,
    { categoryName: string; categoryColor: string | null; total: number }
  >();

  let totalExpenses = 0;

  for (const expense of expenses) {
    const amount = Number(expense.amount);
    totalExpenses += amount;

    const data = byCategory.get(expense.categoryId) || {
      categoryName: expense.category.name,
      categoryColor: expense.category.color,
      total: 0,
    };
    data.total += amount;
    byCategory.set(expense.categoryId, data);
  }

  return Array.from(byCategory.entries())
    .map(([categoryId, data]) => ({
      categoryId,
      categoryName: data.categoryName,
      categoryColor: data.categoryColor,
      total: data.total,
      percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export async function getMonthlyTrend(
  months: number = 6,
): Promise<MonthlyTrend[]> {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

  const [incomes, expenses] = await Promise.all([
    prisma.income.findMany({
      where: { date: { gte: startDate } },
    }),
    prisma.expense.findMany({
      where: { date: { gte: startDate } },
    }),
  ]);

  const monthlyData = new Map<string, { income: number; expenses: number }>();

  // Initialize months
  for (let i = 0; i < months; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyData.set(key, { income: 0, expenses: 0 });
  }

  for (const income of incomes) {
    const date = new Date(income.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const data = monthlyData.get(key);
    if (data) {
      data.income += Number(income.amount);
    }
  }

  for (const expense of expenses) {
    const date = new Date(expense.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const data = monthlyData.get(key);
    if (data) {
      data.expenses += Number(expense.amount);
    }
  }

  return Array.from(monthlyData.entries())
    .map(([key, data]) => {
      const [year, month] = key.split("-");
      return {
        month: key,
        year: parseInt(year),
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses,
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));
}

export async function getBudgetProgress(): Promise<BudgetProgress[]> {
  const budgets = await prisma.budget.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
  });

  return budgets.map((budget) => {
    const target = Number(budget.targetAmount);
    const current = Number(budget.currentAmount);
    return {
      budgetId: budget.id,
      budgetName: budget.name,
      type: budget.type,
      targetAmount: target,
      currentAmount: current,
      progress: target > 0 ? (current / target) * 100 : 0,
      status: budget.status,
    };
  });
}

export async function getRecentTransactions(
  limit: number = 10,
): Promise<RecentTransaction[]> {
  const [incomes, expenses, transfers] = await Promise.all([
    prisma.income.findMany({
      take: limit,
      orderBy: { date: "desc" },
      include: { currency: true, account: true },
    }),
    prisma.expense.findMany({
      take: limit,
      orderBy: { date: "desc" },
      include: { currency: true, account: true, category: true },
    }),
    prisma.transfer.findMany({
      take: limit,
      orderBy: { date: "desc" },
      include: { currency: true, fromAccount: true },
    }),
  ]);

  const transactions: RecentTransaction[] = [
    ...incomes.map((inc) => ({
      id: inc.id,
      type: "income" as const,
      amount: Number(inc.amount),
      currencyCode: inc.currency.code,
      description: inc.description,
      date: inc.date,
      account: inc.account.name,
    })),
    ...expenses.map((exp) => ({
      id: exp.id,
      type: "expense" as const,
      amount: Number(exp.amount),
      currencyCode: exp.currency.code,
      description: exp.description,
      date: exp.date,
      category: exp.category.name,
      account: exp.account.name,
    })),
    ...transfers.map((tr) => ({
      id: tr.id,
      type: "transfer" as const,
      amount: Number(tr.amount),
      currencyCode: tr.currency.code,
      description: tr.description,
      date: tr.date,
      account: tr.fromAccount?.name ?? "Budget",
    })),
  ];

  return transactions
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}

export async function getDashboardSummary(
  filters?: DashboardFilters,
): Promise<DashboardSummary> {
  const [
    kpis,
    balanceByAccount,
    balanceByCurrency,
    expensesByCategory,
    monthlyTrend,
    budgetProgress,
    recentTransactions,
  ] = await Promise.all([
    getKPIs(filters),
    getBalanceByAccount(),
    getBalanceByCurrency(),
    getExpensesByCategory(filters),
    getMonthlyTrend(),
    getBudgetProgress(),
    getRecentTransactions(),
  ]);

  return {
    kpis,
    balanceByAccount,
    balanceByCurrency,
    expensesByCategory,
    monthlyTrend,
    budgetProgress,
    recentTransactions,
  };
}
