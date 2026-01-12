import { prisma } from "@/lib/prisma";

// v1.3.0: Combined transaction type
export type TransactionType =
  | "income"
  | "expense"
  | "transfer"
  | "contribution"
  | "withdrawal";

export interface TransactionHistoryItem {
  id: string;
  type: TransactionType;
  amount: number;
  date: Date;
  description: string | null;
  createdAt: Date;
  // Related entities
  account?: {
    id: string;
    name: string;
  };
  fromAccount?: {
    id: string;
    name: string;
  };
  toAccount?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
    parent?: { id: string; name: string } | null;
  };
  currency: {
    id: string;
    code: string;
    symbol: string;
  };
  budget?: {
    id: string;
    name: string;
  };
  job?: {
    id: string;
    name: string;
  };
  // For display
  displayName: string;
}

export interface TransactionHistoryFilters {
  type?: TransactionType;
  accountId?: string;
  categoryId?: string;
  currencyId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}

export async function getTransactionHistory(
  filters: TransactionHistoryFilters,
) {
  const {
    type,
    accountId,
    categoryId,
    currencyId,
    startDate,
    endDate,
    page = 1,
    pageSize = 20,
  } = filters;

  const transactions: TransactionHistoryItem[] = [];

  // Build date filter
  const dateFilter =
    startDate || endDate
      ? {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        }
      : undefined;

  // Fetch incomes
  if (!type || type === "income") {
    const incomes = await prisma.income.findMany({
      where: {
        ...(accountId && { accountId }),
        ...(currencyId && { currencyId }),
        ...(dateFilter && { date: dateFilter }),
      },
      include: {
        account: { select: { id: true, name: true } },
        job: { select: { id: true, name: true } },
        currency: { select: { id: true, code: true, symbol: true } },
      },
      orderBy: { date: "desc" },
    });

    incomes.forEach((income) => {
      transactions.push({
        id: income.id,
        type: "income",
        amount: Number(income.amount),
        date: income.date,
        description: income.description,
        createdAt: income.createdAt,
        account: income.account,
        job: income.job ?? undefined,
        currency: income.currency,
        // v1.4.0: Show "Ingreso Extra" for incomes without job
        displayName: income.job?.name ?? "Ingreso Extra",
      });
    });
  }

  // Fetch expenses
  if (!type || type === "expense") {
    const expenses = await prisma.expense.findMany({
      where: {
        ...(accountId && { accountId }),
        ...(categoryId && { categoryId }),
        ...(currencyId && { currencyId }),
        ...(dateFilter && { date: dateFilter }),
      },
      include: {
        account: { select: { id: true, name: true } },
        category: {
          select: {
            id: true,
            name: true,
            parent: { select: { id: true, name: true } },
          },
        },
        currency: { select: { id: true, code: true, symbol: true } },
      },
      orderBy: { date: "desc" },
    });

    expenses.forEach((expense) => {
      // Build display name with parent if exists
      const categoryDisplayName = expense.category.parent
        ? `${expense.category.name} (${expense.category.parent.name})`
        : expense.category.name;

      transactions.push({
        id: expense.id,
        type: "expense",
        amount: Number(expense.amount),
        date: expense.date,
        description: expense.description,
        createdAt: expense.createdAt,
        account: expense.account,
        category: expense.category,
        currency: expense.currency,
        displayName: categoryDisplayName,
      });
    });
  }

  // Fetch transfers (account to account only)
  if (!type || type === "transfer") {
    const transferWhereBase = {
      type: "account_to_account" as const,
      ...(dateFilter && { date: dateFilter }),
    };

    // Add account filter if present
    const transferWhere = accountId
      ? {
          ...transferWhereBase,
          OR: [{ fromAccountId: accountId }, { toAccountId: accountId }],
        }
      : transferWhereBase;

    const transfers = await prisma.transfer.findMany({
      where: {
        ...transferWhere,
        ...(currencyId && { currencyId }),
      },
      include: {
        fromAccount: { select: { id: true, name: true } },
        toAccount: { select: { id: true, name: true } },
        currency: { select: { id: true, code: true, symbol: true } },
      },
      orderBy: { date: "desc" },
    });

    transfers.forEach((transfer) => {
      if (transfer.fromAccount && transfer.toAccount) {
        transactions.push({
          id: transfer.id,
          type: "transfer",
          amount: Number(transfer.amount),
          date: transfer.date,
          description: transfer.description,
          createdAt: transfer.createdAt,
          fromAccount: transfer.fromAccount,
          toAccount: transfer.toAccount,
          currency: transfer.currency,
          displayName: `${transfer.fromAccount.name} -> ${transfer.toAccount.name}`,
        });
      }
    });
  }

  // Fetch budget contributions (positive amounts)
  if (!type || type === "contribution") {
    const contributionWhere = {
      amount: { gt: 0 },
      ...(dateFilter && { date: dateFilter }),
      ...(accountId && { fromAccountId: accountId }),
    };

    const contributions = await prisma.budgetContribution.findMany({
      where: contributionWhere,
      include: {
        budget: {
          select: {
            id: true,
            name: true,
            currency: { select: { id: true, code: true, symbol: true } },
          },
        },
        fromAccount: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
    });

    contributions.forEach((contrib) => {
      transactions.push({
        id: contrib.id,
        type: "contribution",
        amount: Math.abs(Number(contrib.amount)),
        date: contrib.date,
        description: contrib.description,
        createdAt: contrib.createdAt,
        account: contrib.fromAccount || undefined,
        budget: { id: contrib.budget.id, name: contrib.budget.name },
        currency: contrib.budget.currency,
        displayName: `Contribucion a ${contrib.budget.name}`,
      });
    });
  }

  // Fetch budget withdrawals (negative amounts)
  if (!type || type === "withdrawal") {
    const withdrawalWhere = {
      amount: { lt: 0 },
      ...(dateFilter && { date: dateFilter }),
      ...(accountId && { toAccountId: accountId }),
    };

    const withdrawals = await prisma.budgetContribution.findMany({
      where: withdrawalWhere,
      include: {
        budget: {
          select: {
            id: true,
            name: true,
            currency: { select: { id: true, code: true, symbol: true } },
          },
        },
        toAccount: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
    });

    withdrawals.forEach((withdrawal) => {
      transactions.push({
        id: withdrawal.id,
        type: "withdrawal",
        amount: Math.abs(Number(withdrawal.amount)),
        date: withdrawal.date,
        description: withdrawal.description,
        createdAt: withdrawal.createdAt,
        account: withdrawal.toAccount || undefined,
        budget: { id: withdrawal.budget.id, name: withdrawal.budget.name },
        currency: withdrawal.budget.currency,
        displayName: `Retiro de ${withdrawal.budget.name}`,
      });
    });
  }

  // Sort all transactions by date (most recent first)
  transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Get total count before pagination
  const total = transactions.length;

  // Apply pagination
  const startIndex = (page - 1) * pageSize;
  const paginatedTransactions = transactions.slice(
    startIndex,
    startIndex + pageSize,
  );

  return {
    transactions: paginatedTransactions,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
