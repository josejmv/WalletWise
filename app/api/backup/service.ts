import { prisma } from "@/lib/prisma";

export interface BackupData {
  version: string;
  exportedAt: string;
  data: {
    currencies: unknown[];
    accountTypes: unknown[];
    categories: unknown[];
    inventoryCategories: unknown[];
    accounts: unknown[];
    jobs: unknown[];
    incomes: unknown[];
    expenses: unknown[];
    transfers: unknown[];
    budgets: unknown[];
    budgetContributions: unknown[];
    inventoryItems: unknown[];
    inventoryPriceHistory: unknown[];
    exchangeRates: unknown[];
  };
}

export async function exportAllData(): Promise<BackupData> {
  const [
    currencies,
    accountTypes,
    categories,
    inventoryCategories,
    accounts,
    jobs,
    incomes,
    expenses,
    transfers,
    budgets,
    budgetContributions,
    inventoryItems,
    inventoryPriceHistory,
    exchangeRates,
  ] = await Promise.all([
    prisma.currency.findMany(),
    prisma.accountType.findMany(),
    prisma.category.findMany(),
    prisma.inventoryCategory.findMany(),
    prisma.account.findMany(),
    prisma.job.findMany(),
    prisma.income.findMany(),
    prisma.expense.findMany(),
    prisma.transfer.findMany(),
    prisma.budget.findMany(),
    prisma.budgetContribution.findMany(),
    prisma.inventoryItem.findMany(),
    prisma.inventoryPriceHistory.findMany(),
    prisma.exchangeRate.findMany(),
  ]);

  return {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    data: {
      currencies,
      accountTypes,
      categories,
      inventoryCategories,
      accounts,
      jobs,
      incomes,
      expenses,
      transfers,
      budgets,
      budgetContributions,
      inventoryItems,
      inventoryPriceHistory,
      exchangeRates,
    },
  };
}

export async function importAllData(backup: BackupData): Promise<{
  imported: Record<string, number>;
  errors: string[];
}> {
  const imported: Record<string, number> = {};
  const errors: string[] = [];

  // ID mapping: oldId -> newId (for reference data that may have different IDs)
  const currencyIdMap = new Map<string, string>();
  const accountTypeIdMap = new Map<string, string>();
  const invCategoryIdMap = new Map<string, string>();

  try {
    // Import in dependency order using transactions
    await prisma.$transaction(
      async (tx) => {
        // 1. Reference data (no dependencies)
        // Use unique fields (code, name, type) for upsert to handle seed conflicts
        // Build ID maps to translate foreign keys in dependent entities
        if (backup.data.currencies?.length) {
          for (const currency of backup.data.currencies as any[]) {
            const result = await tx.currency.upsert({
              where: { code: currency.code },
              update: {
                name: currency.name,
                symbol: currency.symbol,
                isBase: currency.isBase,
              },
              create: currency,
            });
            currencyIdMap.set(currency.id, result.id);
          }
          imported.currencies = backup.data.currencies.length;
        }

        if (backup.data.accountTypes?.length) {
          for (const accountType of backup.data.accountTypes as any[]) {
            const result = await tx.accountType.upsert({
              where: { type: accountType.type },
              update: {
                name: accountType.name,
                description: accountType.description,
              },
              create: {
                id: accountType.id,
                name: accountType.name,
                type: accountType.type,
                description: accountType.description,
              },
            });
            accountTypeIdMap.set(accountType.id, result.id);
          }
          imported.accountTypes = backup.data.accountTypes.length;
        }

        if (backup.data.categories?.length) {
          // First pass: create without parent
          for (const category of backup.data.categories as any[]) {
            await tx.category.upsert({
              where: { id: category.id },
              update: {
                name: category.name,
                color: category.color,
                icon: category.icon,
              },
              create: {
                id: category.id,
                name: category.name,
                color: category.color,
                icon: category.icon,
                parentId: null,
              },
            });
          }
          // Second pass: set parent relationships
          for (const category of backup.data.categories as any[]) {
            if (category.parentId) {
              await tx.category.update({
                where: { id: category.id },
                data: { parentId: category.parentId },
              });
            }
          }
          imported.categories = backup.data.categories.length;
        }

        if (backup.data.inventoryCategories?.length) {
          for (const cat of backup.data.inventoryCategories as any[]) {
            const result = await tx.inventoryCategory.upsert({
              where: { name: cat.name },
              update: {
                icon: cat.icon,
                color: cat.color,
                description: cat.description,
              },
              create: {
                id: cat.id,
                name: cat.name,
                icon: cat.icon,
                color: cat.color,
                description: cat.description,
              },
            });
            invCategoryIdMap.set(cat.id, result.id);
          }
          imported.inventoryCategories = backup.data.inventoryCategories.length;
        }

        // Helper to translate IDs using maps
        const mapCurrencyId = (id: string | null): string | undefined =>
          id ? currencyIdMap.get(id) || id : undefined;
        const mapAccountTypeId = (id: string | null): string | undefined =>
          id ? accountTypeIdMap.get(id) || id : undefined;
        const mapInvCategoryId = (id: string | null): string | undefined =>
          id ? invCategoryIdMap.get(id) || id : undefined;

        // 2. Primary entities (depend on reference data)
        if (backup.data.accounts?.length) {
          for (const account of backup.data.accounts as any[]) {
            const mappedCurrencyId = mapCurrencyId(account.currencyId);
            const mappedAccountTypeId = mapAccountTypeId(account.accountTypeId);
            await tx.account.upsert({
              where: { id: account.id },
              update: {
                name: account.name,
                balance: account.balance,
                currencyId: mappedCurrencyId,
                accountTypeId: mappedAccountTypeId,
                isActive: account.isActive,
              },
              create: {
                ...account,
                currencyId: mappedCurrencyId,
                accountTypeId: mappedAccountTypeId,
              },
            });
          }
          imported.accounts = backup.data.accounts.length;
        }

        if (backup.data.jobs?.length) {
          for (const job of backup.data.jobs as any[]) {
            const mappedCurrencyId = mapCurrencyId(job.currencyId);
            await tx.job.upsert({
              where: { id: job.id },
              update: {
                name: job.name,
                type: job.type,
                salary: job.salary,
                currencyId: mappedCurrencyId,
                accountId: job.accountId,
                periodicity: job.periodicity,
                payDay: job.payDay,
                status: job.status,
              },
              create: {
                ...job,
                currencyId: mappedCurrencyId,
              },
            });
          }
          imported.jobs = backup.data.jobs.length;
        }

        // 3. Transactions (depend on primary entities)
        // First pass: import without changeTransferId (FK to transfers not yet imported)
        if (backup.data.incomes?.length) {
          for (const income of backup.data.incomes as any[]) {
            const mappedCurrencyId = mapCurrencyId(income.currencyId);
            const mappedChangeCurrencyId = mapCurrencyId(income.changeCurrencyId);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { changeTransferId, ...incomeWithoutTransfer } = income;
            await tx.income.upsert({
              where: { id: income.id },
              update: {
                jobId: income.jobId,
                accountId: income.accountId,
                amount: income.amount,
                currencyId: mappedCurrencyId,
                date: new Date(income.date),
                description: income.description,
                hasChange: income.hasChange,
                changeAmount: income.changeAmount,
                changeCurrencyId: mappedChangeCurrencyId,
                changeAccountId: income.changeAccountId,
              },
              create: {
                ...incomeWithoutTransfer,
                currencyId: mappedCurrencyId,
                changeCurrencyId: mappedChangeCurrencyId,
                date: new Date(income.date),
              },
            });
          }
          imported.incomes = backup.data.incomes.length;
        }

        if (backup.data.expenses?.length) {
          for (const expense of backup.data.expenses as any[]) {
            const mappedCurrencyId = mapCurrencyId(expense.currencyId);
            const mappedChangeCurrencyId = mapCurrencyId(expense.changeCurrencyId);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { changeTransferId, ...expenseWithoutTransfer } = expense;
            await tx.expense.upsert({
              where: { id: expense.id },
              update: {
                categoryId: expense.categoryId,
                accountId: expense.accountId,
                amount: expense.amount,
                currencyId: mappedCurrencyId,
                officialRate: expense.officialRate,
                customRate: expense.customRate,
                isRecurring: expense.isRecurring,
                periodicity: expense.periodicity,
                nextDueDate: expense.nextDueDate
                  ? new Date(expense.nextDueDate)
                  : null,
                date: new Date(expense.date),
                description: expense.description,
                hasChange: expense.hasChange,
                changeAmount: expense.changeAmount,
                changeCurrencyId: mappedChangeCurrencyId,
                changeAccountId: expense.changeAccountId,
              },
              create: {
                ...expenseWithoutTransfer,
                currencyId: mappedCurrencyId,
                changeCurrencyId: mappedChangeCurrencyId,
                date: new Date(expense.date),
                nextDueDate: expense.nextDueDate
                  ? new Date(expense.nextDueDate)
                  : null,
              },
            });
          }
          imported.expenses = backup.data.expenses.length;
        }

        if (backup.data.transfers?.length) {
          for (const transfer of backup.data.transfers as any[]) {
            const mappedCurrencyId = mapCurrencyId(transfer.currencyId);
            await tx.transfer.upsert({
              where: { id: transfer.id },
              update: {
                fromAccountId: transfer.fromAccountId,
                toAccountId: transfer.toAccountId,
                amount: transfer.amount,
                currencyId: mappedCurrencyId,
                exchangeRate: transfer.exchangeRate,
                date: new Date(transfer.date),
                description: transfer.description,
              },
              create: {
                ...transfer,
                currencyId: mappedCurrencyId,
                date: new Date(transfer.date),
              },
            });
          }
          imported.transfers = backup.data.transfers.length;
        }

        // Second pass: link changeTransferId now that transfers exist
        if (backup.data.incomes?.length) {
          for (const income of backup.data.incomes as any[]) {
            if (income.changeTransferId) {
              await tx.income.update({
                where: { id: income.id },
                data: { changeTransferId: income.changeTransferId },
              });
            }
          }
        }

        if (backup.data.expenses?.length) {
          for (const expense of backup.data.expenses as any[]) {
            if (expense.changeTransferId) {
              await tx.expense.update({
                where: { id: expense.id },
                data: { changeTransferId: expense.changeTransferId },
              });
            }
          }
        }

        if (backup.data.budgets?.length) {
          for (const budget of backup.data.budgets as any[]) {
            const mappedCurrencyId = mapCurrencyId(budget.currencyId);
            await tx.budget.upsert({
              where: { id: budget.id },
              update: {
                name: budget.name,
                type: budget.type,
                targetAmount: budget.targetAmount,
                currentAmount: budget.currentAmount,
                currencyId: mappedCurrencyId,
                accountId: budget.accountId,
                deadline: budget.deadline ? new Date(budget.deadline) : null,
                status: budget.status,
              },
              create: {
                ...budget,
                currencyId: mappedCurrencyId,
                deadline: budget.deadline ? new Date(budget.deadline) : null,
              },
            });
          }
          imported.budgets = backup.data.budgets.length;
        }

        if (backup.data.budgetContributions?.length) {
          for (const contrib of backup.data.budgetContributions as any[]) {
            await tx.budgetContribution.upsert({
              where: { id: contrib.id },
              update: {
                budgetId: contrib.budgetId,
                amount: contrib.amount,
                date: new Date(contrib.date),
              },
              create: {
                ...contrib,
                date: new Date(contrib.date),
              },
            });
          }
          imported.budgetContributions = backup.data.budgetContributions.length;
        }

        // 4. Inventory
        if (backup.data.inventoryItems?.length) {
          for (const item of backup.data.inventoryItems as any[]) {
            const mappedCurrencyId = mapCurrencyId(item.currencyId);
            const mappedCategoryId = mapInvCategoryId(item.categoryId);
            await tx.inventoryItem.upsert({
              where: { id: item.id },
              update: {
                name: item.name,
                categoryId: mappedCategoryId,
                currentQuantity: item.currentQuantity,
                minQuantity: item.minQuantity,
                maxQuantity: item.maxQuantity,
                unit: item.unit,
                estimatedPrice: item.estimatedPrice,
                currencyId: mappedCurrencyId,
                notes: item.notes,
                isActive: item.isActive,
              },
              create: {
                ...item,
                currencyId: mappedCurrencyId,
                categoryId: mappedCategoryId,
              },
            });
          }
          imported.inventoryItems = backup.data.inventoryItems.length;
        }

        if (backup.data.inventoryPriceHistory?.length) {
          for (const history of backup.data.inventoryPriceHistory as any[]) {
            // currencyId is required, use original as fallback
            const mappedCurrencyId =
              mapCurrencyId(history.currencyId) || history.currencyId;
            await tx.inventoryPriceHistory.upsert({
              where: { id: history.id },
              update: {
                itemId: history.itemId,
                price: history.price,
                currencyId: mappedCurrencyId,
                source: history.source,
                date: new Date(history.date),
              },
              create: {
                id: history.id,
                itemId: history.itemId,
                price: history.price,
                currencyId: mappedCurrencyId,
                source: history.source,
                date: new Date(history.date),
              },
            });
          }
          imported.inventoryPriceHistory =
            backup.data.inventoryPriceHistory.length;
        }

        // 5. Exchange rates
        if (backup.data.exchangeRates?.length) {
          for (const rate of backup.data.exchangeRates as any[]) {
            const mappedFromCurrencyId = mapCurrencyId(rate.fromCurrencyId);
            const mappedToCurrencyId = mapCurrencyId(rate.toCurrencyId);
            await tx.exchangeRate.upsert({
              where: { id: rate.id },
              update: {
                fromCurrencyId: mappedFromCurrencyId,
                toCurrencyId: mappedToCurrencyId,
                rate: rate.rate,
                fetchedAt: new Date(rate.fetchedAt),
              },
              create: {
                ...rate,
                fromCurrencyId: mappedFromCurrencyId,
                toCurrencyId: mappedToCurrencyId,
                fetchedAt: new Date(rate.fetchedAt),
              },
            });
          }
          imported.exchangeRates = backup.data.exchangeRates.length;
        }
      },
      { timeout: 60000 },
    );
  } catch (error) {
    errors.push(
      error instanceof Error ? error.message : "Error durante la importacion",
    );
  }

  return { imported, errors };
}

export function convertToCSV(backup: BackupData): string {
  const lines: string[] = [];

  // Helper to convert array of objects to CSV section
  const arrayToCSV = (name: string, arr: unknown[]) => {
    if (!arr || arr.length === 0) return;

    lines.push(`\n### ${name.toUpperCase()} ###`);
    const items = arr as Record<string, unknown>[];
    const headers = Object.keys(items[0]);
    lines.push(headers.join(","));

    for (const item of items) {
      const values = headers.map((h) => {
        const val = item[h];
        if (val === null || val === undefined) return "";
        if (typeof val === "string" && (val.includes(",") || val.includes('"')))
          return `"${val.replace(/"/g, '""')}"`;
        return String(val);
      });
      lines.push(values.join(","));
    }
  };

  lines.push(`# WalletWise Backup - ${backup.exportedAt}`);
  lines.push(`# Version: ${backup.version}`);

  arrayToCSV("currencies", backup.data.currencies);
  arrayToCSV("accountTypes", backup.data.accountTypes);
  arrayToCSV("categories", backup.data.categories);
  arrayToCSV("inventoryCategories", backup.data.inventoryCategories);
  arrayToCSV("accounts", backup.data.accounts);
  arrayToCSV("jobs", backup.data.jobs);
  arrayToCSV("incomes", backup.data.incomes);
  arrayToCSV("expenses", backup.data.expenses);
  arrayToCSV("transfers", backup.data.transfers);
  arrayToCSV("budgets", backup.data.budgets);
  arrayToCSV("budgetContributions", backup.data.budgetContributions);
  arrayToCSV("inventoryItems", backup.data.inventoryItems);
  arrayToCSV("inventoryPriceHistory", backup.data.inventoryPriceHistory);
  arrayToCSV("exchangeRates", backup.data.exchangeRates);

  return lines.join("\n");
}
