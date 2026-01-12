import { prisma } from "@/lib/prisma";
import {
  getUserBaseCurrencyId,
  getUserBaseCurrency,
  convertManyToBaseCurrency,
  convertManyWithCustomRates,
  calculateSavings,
  isSavingsRate,
} from "@/lib/currency-utils";
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
  SavingsData,
} from "./types";

export async function getKPIs(
  filters?: DashboardFilters,
): Promise<DashboardKPIs> {
  const dateFilter = {
    ...(filters?.startDate && { gte: filters.startDate }),
    ...(filters?.endDate && { lte: filters.endDate }),
  };

  // Get user's base currency for conversions
  const baseCurrencyId = await getUserBaseCurrencyId();

  const [accounts, incomes, expenses, activeJobs, activeBudgets] =
    await Promise.all([
      prisma.account.findMany({
        where: { isActive: true },
        select: { id: true, balance: true, currencyId: true },
      }),
      prisma.income.findMany({
        where:
          Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined,
        select: { id: true, amount: true, currencyId: true },
      }),
      // v1.3.0: Include customRate for expense conversion
      prisma.expense.findMany({
        where:
          Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined,
        select: { id: true, amount: true, currencyId: true, customRate: true },
      }),
      prisma.job.count({ where: { status: "active" } }),
      prisma.budget.count({ where: { status: "active" } }),
    ]);

  // Convert all amounts to base currency
  const accountsConverted = await convertManyToBaseCurrency(
    accounts.map((a) => ({ ...a, amount: Number(a.balance) })),
    baseCurrencyId,
  );
  const incomesConverted = await convertManyToBaseCurrency(
    incomes.map((i) => ({ ...i, amount: Number(i.amount) })),
    baseCurrencyId,
  );
  // v1.3.0: Use custom rates for expense conversion when available
  const expensesConverted = await convertManyWithCustomRates(
    expenses.map((e) => ({
      ...e,
      amount: Number(e.amount),
      customRate: e.customRate ? Number(e.customRate) : null,
    })),
    baseCurrencyId,
  );

  const totalBalance = accountsConverted.reduce(
    (sum, acc) => sum + acc.convertedAmount,
    0,
  );
  const totalIncome = incomesConverted.reduce(
    (sum, inc) => sum + inc.convertedAmount,
    0,
  );
  const totalExpenses = expensesConverted.reduce(
    (sum, exp) => sum + exp.convertedAmount,
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
  const [accounts, baseCurrencyId] = await Promise.all([
    prisma.account.findMany({
      where: { isActive: true },
      include: { currency: true },
    }),
    getUserBaseCurrencyId(),
  ]);

  const byCurrency = new Map<
    string,
    { currencyCode: string; total: number; currencyId: string }
  >();

  for (const account of accounts) {
    const data = byCurrency.get(account.currencyId) || {
      currencyCode: account.currency.code,
      currencyId: account.currencyId,
      total: 0,
    };
    data.total += Number(account.balance);
    byCurrency.set(account.currencyId, data);
  }

  // Convert each currency total to base currency
  const entries = Array.from(byCurrency.entries());
  const converted = await convertManyToBaseCurrency(
    entries.map(([, data]) => ({
      amount: data.total,
      currencyId: data.currencyId,
      currencyCode: data.currencyCode,
    })),
    baseCurrencyId,
  );

  return converted.map((item) => ({
    currencyId: item.currencyId,
    currencyCode: item.currencyCode,
    totalBalance: item.amount, // Original amount in that currency
    convertedBalance: item.convertedAmount, // Amount in base currency
  }));
}

export async function getExpensesByCategory(
  filters?: DashboardFilters,
): Promise<ExpensesByCategory[]> {
  const dateFilter = {
    ...(filters?.startDate && { gte: filters.startDate }),
    ...(filters?.endDate && { lte: filters.endDate }),
  };

  // v1.3.0: Include customRate for expense conversion
  const [expenses, baseCurrencyId] = await Promise.all([
    prisma.expense.findMany({
      where:
        Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined,
      select: {
        id: true,
        amount: true,
        currencyId: true,
        customRate: true,
        categoryId: true,
        category: { select: { name: true, color: true } },
      },
    }),
    getUserBaseCurrencyId(),
  ]);

  // v1.3.0: Use custom rates for expense conversion when available
  const expensesConverted = await convertManyWithCustomRates(
    expenses.map((e) => ({
      ...e,
      amount: Number(e.amount),
      customRate: e.customRate ? Number(e.customRate) : null,
    })),
    baseCurrencyId,
  );

  const byCategory = new Map<
    string,
    { categoryName: string; categoryColor: string | null; total: number }
  >();

  let totalExpenses = 0;

  for (const expense of expensesConverted) {
    const amount = expense.convertedAmount;
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

  const [incomes, expenses, baseCurrencyId] = await Promise.all([
    prisma.income.findMany({
      where: { date: { gte: startDate } },
      select: { id: true, date: true, amount: true, currencyId: true },
    }),
    prisma.expense.findMany({
      where: { date: { gte: startDate } },
      select: { id: true, date: true, amount: true, currencyId: true },
    }),
    getUserBaseCurrencyId(),
  ]);

  // Convert all amounts to base currency
  const incomesConverted = await convertManyToBaseCurrency(
    incomes.map((i) => ({
      ...i,
      amount: Number(i.amount),
    })),
    baseCurrencyId,
  );
  const expensesConverted = await convertManyToBaseCurrency(
    expenses.map((e) => ({
      ...e,
      amount: Number(e.amount),
    })),
    baseCurrencyId,
  );

  const monthlyData = new Map<string, { income: number; expenses: number }>();

  // Initialize months
  for (let i = 0; i < months; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyData.set(key, { income: 0, expenses: 0 });
  }

  for (const income of incomesConverted) {
    const date = new Date(income.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const data = monthlyData.get(key);
    if (data) {
      data.income += income.convertedAmount;
    }
  }

  for (const expense of expensesConverted) {
    const date = new Date(expense.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const data = monthlyData.get(key);
    if (data) {
      data.expenses += expense.convertedAmount;
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
  // Get transactions created today or yesterday (based on createdAt, not date)
  const now = new Date();
  const startOfYesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1,
  );

  const [incomes, expenses, transfers, contributions] = await Promise.all([
    prisma.income.findMany({
      where: { createdAt: { gte: startOfYesterday } },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { currency: true, account: true },
    }),
    prisma.expense.findMany({
      where: { createdAt: { gte: startOfYesterday } },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        currency: true,
        account: true,
        category: { include: { parent: true } },
      },
    }),
    prisma.transfer.findMany({
      where: { createdAt: { gte: startOfYesterday } },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { currency: true, fromAccount: true },
    }),
    prisma.budgetContribution.findMany({
      where: { createdAt: { gte: startOfYesterday } },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        budget: { include: { currency: true } },
        fromAccount: true,
        toAccount: true,
      },
    }),
  ]);

  // Add createdAt to each transaction for sorting
  const transactionsWithCreatedAt = [
    ...incomes.map((inc) => ({
      id: inc.id,
      type: "income" as const,
      amount: Number(inc.amount),
      currencyCode: inc.currency.code,
      description: inc.description,
      date: inc.date,
      account: inc.account.name,
      createdAt: inc.createdAt,
    })),
    ...expenses.map((exp) => ({
      id: exp.id,
      type: "expense" as const,
      amount: Number(exp.amount),
      currencyCode: exp.currency.code,
      description: exp.description,
      date: exp.date,
      category: exp.category.parent
        ? `${exp.category.name} (${exp.category.parent.name})`
        : exp.category.name,
      account: exp.account.name,
      createdAt: exp.createdAt,
    })),
    ...transfers.map((tr) => ({
      id: tr.id,
      type: "transfer" as const,
      amount: Number(tr.amount),
      currencyCode: tr.currency.code,
      description: tr.description,
      date: tr.date,
      account: tr.fromAccount?.name ?? "Budget",
      createdAt: tr.createdAt,
    })),
    // Add contributions (positive amounts)
    ...contributions
      .filter((c) => Number(c.amount) > 0)
      .map((c) => ({
        id: c.id,
        type: "contribution" as const,
        amount: Math.abs(Number(c.amount)),
        currencyCode: c.budget.currency.code,
        description: c.description,
        date: c.date,
        account: c.fromAccount?.name ?? "Desconocida",
        budgetName: c.budget.name,
        createdAt: c.createdAt,
      })),
    // Add withdrawals (negative amounts)
    ...contributions
      .filter((c) => Number(c.amount) < 0)
      .map((c) => ({
        id: c.id,
        type: "withdrawal" as const,
        amount: Math.abs(Number(c.amount)),
        currencyCode: c.budget.currency.code,
        description: c.description,
        date: c.date,
        account: c.toAccount?.name ?? "Desconocida",
        budgetName: c.budget.name,
        createdAt: c.createdAt,
      })),
  ];

  // Sort by createdAt (most recent first) and remove createdAt from result
  const transactions: RecentTransaction[] = transactionsWithCreatedAt
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit)
    .map(({ createdAt, ...rest }) => rest);

  return transactions;
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

/**
 * Calculate savings from using custom exchange rates vs official rates
 *
 * FORMULA CORREGIDA:
 * - En Venezuela, los precios estan en USD pero se paga en VES
 * - Tasa oficial ejemplo: 50 VES/USD
 * - Tasa custom ejemplo: 45 VES/USD (mejor tasa del comercio)
 * - Producto de 100 USD:
 *   - A tasa oficial pagaria: 100 * 50 = 5000 VES
 *   - A tasa custom paga: 100 * 45 = 4500 VES
 *   - Ahorro: 5000 - 4500 = 500 VES
 *
 * REGLA: Si tasa_custom < tasa_oficial = AHORRO (pagas menos VES)
 * Savings = amount * (officialRate - customRate)
 * - Positivo = dinero ahorrado
 * - Negativo = dinero extra pagado
 */
export async function getSavingsData(): Promise<SavingsData> {
  // Get expenses with both official and custom rates
  const [expenses, transfers, baseCurrency] = await Promise.all([
    prisma.expense.findMany({
      where: {
        AND: [{ officialRate: { not: null } }, { customRate: { not: null } }],
      },
      select: {
        id: true,
        amount: true,
        officialRate: true,
        customRate: true,
      },
    }),
    prisma.transfer.findMany({
      where: {
        AND: [{ officialRate: { not: null } }, { customRate: { not: null } }],
      },
      select: {
        id: true,
        amount: true,
        officialRate: true,
        customRate: true,
      },
    }),
    getUserBaseCurrency(),
  ]);

  // Calculate savings for expenses using corrected formula
  let expenseSavings = 0;
  for (const expense of expenses) {
    const amount = Number(expense.amount);
    const officialRate = Number(expense.officialRate);
    const customRate = Number(expense.customRate);
    // Savings = what you would pay at official - what you paid at custom
    // If positive = saved money (custom was lower)
    // If negative = paid extra (custom was higher)
    expenseSavings += calculateSavings(amount, officialRate, customRate);
  }

  // Calculate savings for transfers using same corrected formula
  let transferSavings = 0;
  for (const transfer of transfers) {
    const amount = Number(transfer.amount);
    const officialRate = Number(transfer.officialRate);
    const customRate = Number(transfer.customRate);
    transferSavings += calculateSavings(amount, officialRate, customRate);
  }

  const totalSavings = expenseSavings + transferSavings;
  const transactionCount = expenses.length + transfers.length;

  return {
    totalSavings,
    transactionCount,
    breakdown: {
      incomes: { savings: 0, count: 0 }, // Income doesn't have rate fields yet
      expenses: { savings: expenseSavings, count: expenses.length },
      transfers: { savings: transferSavings, count: transfers.length },
    },
    currencyCode: baseCurrency.code,
  };
}
