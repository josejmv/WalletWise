import { prisma } from "@/lib/prisma";
import {
  getUserBaseCurrencyId,
  getUserBaseCurrency,
  convertManyToBaseCurrency,
} from "@/lib/currency-utils";
import type {
  ReportFilters,
  MonthlyReport,
  CategoryReport,
  AccountReport,
  BudgetReport,
  FinancialSummary,
} from "./types";

function getDateRange(filters?: ReportFilters): {
  startDate: Date;
  endDate: Date;
} {
  const now = new Date();
  const startDate =
    filters?.startDate || new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate =
    filters?.endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { startDate, endDate };
}

export async function getMonthlyReport(
  year: number,
  month: number,
): Promise<MonthlyReport> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const [incomes, expenses, transfers, baseCurrencyId] = await Promise.all([
    prisma.income.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      select: {
        id: true,
        amount: true,
        currencyId: true,
        job: { select: { name: true } },
      },
    }),
    prisma.expense.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      select: {
        id: true,
        amount: true,
        currencyId: true,
        category: { select: { name: true } },
      },
    }),
    prisma.transfer.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      select: { id: true, amount: true, currencyId: true },
    }),
    getUserBaseCurrencyId(),
  ]);

  // Convert all amounts to base currency
  const incomesConverted = await convertManyToBaseCurrency(
    incomes.map((i) => ({ ...i, amount: Number(i.amount) })),
    baseCurrencyId,
  );
  const expensesConverted = await convertManyToBaseCurrency(
    expenses.map((e) => ({ ...e, amount: Number(e.amount) })),
    baseCurrencyId,
  );
  const transfersConverted = await convertManyToBaseCurrency(
    transfers.map((t) => ({ ...t, amount: Number(t.amount) })),
    baseCurrencyId,
  );

  const totalIncome = incomesConverted.reduce(
    (sum, inc) => sum + inc.convertedAmount,
    0,
  );
  const totalExpenses = expensesConverted.reduce(
    (sum, exp) => sum + exp.convertedAmount,
    0,
  );
  const totalTransfers = transfersConverted.reduce(
    (sum, tr) => sum + tr.convertedAmount,
    0,
  );

  // Group income by job (using converted amounts)
  // Handle null jobs for "Ingreso Extra"
  const incomeByJob = new Map<string, number>();
  for (const income of incomesConverted) {
    const jobName = income.job?.name ?? "Ingreso Extra";
    const current = incomeByJob.get(jobName) || 0;
    incomeByJob.set(jobName, current + income.convertedAmount);
  }

  // Group expenses by category (using converted amounts)
  const expenseByCategory = new Map<string, number>();
  for (const expense of expensesConverted) {
    const current = expenseByCategory.get(expense.category.name) || 0;
    expenseByCategory.set(
      expense.category.name,
      current + expense.convertedAmount,
    );
  }

  const netFlow = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netFlow / totalIncome) * 100 : 0;

  return {
    month: `${year}-${String(month).padStart(2, "0")}`,
    year,
    income: {
      total: totalIncome,
      count: incomes.length,
      byJob: Array.from(incomeByJob.entries()).map(([jobName, total]) => ({
        jobName,
        total,
      })),
    },
    expenses: {
      total: totalExpenses,
      count: expenses.length,
      byCategory: Array.from(expenseByCategory.entries())
        .map(([categoryName, total]) => ({
          categoryName,
          total,
          percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0,
        }))
        .sort((a, b) => b.total - a.total),
    },
    transfers: {
      total: totalTransfers,
      count: transfers.length,
    },
    netFlow,
    savingsRate,
  };
}

export async function getCategoryReport(
  filters?: ReportFilters,
): Promise<CategoryReport[]> {
  const { startDate, endDate } = getDateRange(filters);

  const categories = await prisma.category.findMany({
    include: {
      expenses: {
        where: { date: { gte: startDate, lte: endDate } },
      },
    },
  });

  const totalAllExpenses = categories.reduce(
    (sum, cat) => sum + cat.expenses.reduce((s, e) => s + Number(e.amount), 0),
    0,
  );

  // Get trend data (last 6 months)
  const now = new Date();
  const trendStartDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const trendExpenses = await prisma.expense.findMany({
    where: { date: { gte: trendStartDate } },
    include: { category: true },
  });

  const trendByCategory = new Map<string, Map<string, number>>();

  for (const expense of trendExpenses) {
    const catTrend = trendByCategory.get(expense.categoryId) || new Map();
    const monthKey = `${expense.date.getFullYear()}-${String(expense.date.getMonth() + 1).padStart(2, "0")}`;
    const current = catTrend.get(monthKey) || 0;
    catTrend.set(monthKey, current + Number(expense.amount));
    trendByCategory.set(expense.categoryId, catTrend);
  }

  return categories
    .map((category) => {
      const totalExpenses = category.expenses.reduce(
        (sum, e) => sum + Number(e.amount),
        0,
      );
      const catTrend = trendByCategory.get(category.id) || new Map();

      return {
        categoryId: category.id,
        categoryName: category.name,
        categoryColor: category.color,
        totalExpenses,
        transactionCount: category.expenses.length,
        averageTransaction:
          category.expenses.length > 0
            ? totalExpenses / category.expenses.length
            : 0,
        percentage:
          totalAllExpenses > 0 ? (totalExpenses / totalAllExpenses) * 100 : 0,
        trend: Array.from(catTrend.entries())
          .map(([month, total]) => ({ month, total }))
          .sort((a, b) => a.month.localeCompare(b.month)),
      };
    })
    .filter((cat) => cat.transactionCount > 0)
    .sort((a, b) => b.totalExpenses - a.totalExpenses);
}

export async function getAccountReport(
  filters?: ReportFilters,
): Promise<AccountReport[]> {
  const { startDate, endDate } = getDateRange(filters);

  const accounts = await prisma.account.findMany({
    where: { isActive: true },
    include: {
      accountType: true,
      currency: true,
      incomes: {
        where: { date: { gte: startDate, lte: endDate } },
      },
      expenses: {
        where: { date: { gte: startDate, lte: endDate } },
      },
      transfersFrom: {
        where: { date: { gte: startDate, lte: endDate } },
      },
      transfersTo: {
        where: { date: { gte: startDate, lte: endDate } },
      },
    },
  });

  return accounts.map((account) => {
    const totalIncome = account.incomes.reduce(
      (sum, inc) => sum + Number(inc.amount),
      0,
    );
    const totalExpenses = account.expenses.reduce(
      (sum, exp) => sum + Number(exp.amount),
      0,
    );
    const totalTransfersIn = account.transfersTo.reduce(
      (sum, tr) => sum + Number(tr.amount),
      0,
    );
    const totalTransfersOut = account.transfersFrom.reduce(
      (sum, tr) => sum + Number(tr.amount),
      0,
    );

    return {
      accountId: account.id,
      accountName: account.name,
      accountType: account.accountType.name,
      currencyCode: account.currency.code,
      currentBalance: Number(account.balance),
      totalIncome,
      totalExpenses,
      totalTransfersIn,
      totalTransfersOut,
      netFlow:
        totalIncome - totalExpenses + totalTransfersIn - totalTransfersOut,
    };
  });
}

export async function getBudgetReport(): Promise<BudgetReport[]> {
  const budgets = await prisma.budget.findMany({
    include: {
      contributions: {
        orderBy: { date: "desc" },
      },
    },
  });

  return budgets.map((budget) => {
    const target = Number(budget.targetAmount);
    const current = Number(budget.currentAmount);
    const progress = target > 0 ? (current / target) * 100 : 0;

    // Calculate projected completion based on contribution rate
    let projectedCompletion: Date | null = null;
    if (budget.contributions.length >= 2 && current < target) {
      const recentContributions = budget.contributions.slice(0, 5);
      const avgContribution =
        recentContributions.reduce((sum, c) => sum + Number(c.amount), 0) /
        recentContributions.length;

      if (avgContribution > 0) {
        const remaining = target - current;
        const monthsToComplete = remaining / avgContribution;
        projectedCompletion = new Date();
        projectedCompletion.setMonth(
          projectedCompletion.getMonth() + Math.ceil(monthsToComplete),
        );
      }
    }

    return {
      budgetId: budget.id,
      budgetName: budget.name,
      type: budget.type,
      targetAmount: target,
      currentAmount: current,
      progress,
      status: budget.status,
      contributions: budget.contributions.map((c) => ({
        date: c.date,
        amount: Number(c.amount),
        description: c.description,
      })),
      projectedCompletion,
    };
  });
}

export async function getFinancialSummary(
  filters?: ReportFilters,
): Promise<FinancialSummary> {
  const { startDate, endDate } = getDateRange(filters);

  const [incomes, expenses, accounts, budgets, baseCurrencyId] =
    await Promise.all([
      prisma.income.findMany({
        where: { date: { gte: startDate, lte: endDate } },
        select: {
          id: true,
          amount: true,
          currencyId: true,
          job: { select: { name: true } },
        },
      }),
      prisma.expense.findMany({
        where: { date: { gte: startDate, lte: endDate } },
        select: {
          id: true,
          amount: true,
          currencyId: true,
          category: { select: { name: true } },
        },
      }),
      prisma.account.findMany({
        where: { isActive: true },
        include: { currency: true },
      }),
      prisma.budget.findMany({
        where: { status: "active" },
      }),
      getUserBaseCurrencyId(),
    ]);

  // Convert all amounts to base currency
  const incomesConverted = await convertManyToBaseCurrency(
    incomes.map((i) => ({ ...i, amount: Number(i.amount) })),
    baseCurrencyId,
  );
  const expensesConverted = await convertManyToBaseCurrency(
    expenses.map((e) => ({ ...e, amount: Number(e.amount) })),
    baseCurrencyId,
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

  // Top expense categories (using converted amounts)
  const expenseByCategory = new Map<string, number>();
  for (const expense of expensesConverted) {
    const current = expenseByCategory.get(expense.category.name) || 0;
    expenseByCategory.set(
      expense.category.name,
      current + expense.convertedAmount,
    );
  }

  const topExpenseCategories = Array.from(expenseByCategory.entries())
    .map(([name, total]) => ({
      name,
      total,
      percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Top income jobs (using converted amounts)
  // Handle null jobs for "Ingreso Extra"
  const incomeByJob = new Map<string, number>();
  for (const income of incomesConverted) {
    const jobName = income.job?.name ?? "Ingreso Extra";
    const current = incomeByJob.get(jobName) || 0;
    incomeByJob.set(jobName, current + income.convertedAmount);
  }

  const topIncomeJobs = Array.from(incomeByJob.entries())
    .map(([name, total]) => ({
      name,
      total,
      percentage: totalIncome > 0 ? (total / totalIncome) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return {
    period: { startDate, endDate },
    overview: {
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
    },
    topExpenseCategories,
    topIncomeJobs,
    accountBalances: accounts.map((acc) => ({
      name: acc.name,
      balance: Number(acc.balance),
      currency: acc.currency.code,
    })),
    budgetStatus: budgets.map((budget) => ({
      name: budget.name,
      progress:
        Number(budget.targetAmount) > 0
          ? (Number(budget.currentAmount) / Number(budget.targetAmount)) * 100
          : 0,
      status: budget.status,
    })),
  };
}

export async function exportTransactions(
  format: "json" | "csv",
  filters?: ReportFilters,
): Promise<string> {
  const { startDate, endDate } = getDateRange(filters);

  const [incomes, expenses, transfers] = await Promise.all([
    prisma.income.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      include: { job: true, account: true, currency: true },
      orderBy: { date: "desc" },
    }),
    prisma.expense.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      include: { category: true, account: true, currency: true },
      orderBy: { date: "desc" },
    }),
    prisma.transfer.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      include: { fromAccount: true, toAccount: true, currency: true },
      orderBy: { date: "desc" },
    }),
  ]);

  const transactions = [
    ...incomes.map((inc) => ({
      type: "income",
      date: inc.date.toISOString(),
      amount: Number(inc.amount),
      currency: inc.currency.code,
      description: inc.description || "",
      // Handle null jobs for "Ingreso Extra"
      category: inc.job?.name ?? "Ingreso Extra",
      account: inc.account.name,
    })),
    ...expenses.map((exp) => ({
      type: "expense",
      date: exp.date.toISOString(),
      amount: Number(exp.amount),
      currency: exp.currency.code,
      description: exp.description || "",
      category: exp.category.name,
      account: exp.account.name,
    })),
    ...transfers.map((tr) => ({
      type: "transfer",
      date: tr.date.toISOString(),
      amount: Number(tr.amount),
      currency: tr.currency.code,
      description: tr.description || "",
      category: `${tr.fromAccount?.name ?? "Budget"} → ${tr.toAccount?.name ?? "Budget"}`,
      account: tr.fromAccount?.name ?? tr.toAccount?.name ?? "Transfer",
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (format === "json") {
    return JSON.stringify(transactions, null, 2);
  }

  // CSV format
  const headers = [
    "type",
    "date",
    "amount",
    "currency",
    "description",
    "category",
    "account",
  ];
  const csvRows = [
    headers.join(","),
    ...transactions.map((t) =>
      headers
        .map((h) => {
          const value = t[h as keyof typeof t];
          return typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : value;
        })
        .join(","),
    ),
  ];

  return csvRows.join("\n");
}
