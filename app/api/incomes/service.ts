import { prisma } from "@/lib/prisma";
import * as repository from "./repository";
import type {
  CreateIncomeInput,
  UpdateIncomeInput,
  IncomeFilters,
} from "./types";
import type { PaginationParams } from "@/lib/pagination";

export async function getIncomes(filters?: IncomeFilters) {
  return repository.findAll(filters);
}

export async function getIncomesPaginated(
  filters?: IncomeFilters,
  pagination?: PaginationParams,
) {
  return repository.findAllPaginated(filters, pagination);
}

export async function getIncomeById(id: string) {
  const income = await repository.findById(id);
  if (!income) {
    throw new Error("Ingreso no encontrado");
  }
  return income;
}

export async function getIncomesByJob(jobId: string) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    throw new Error("Trabajo no encontrado");
  }
  return repository.findByJob(jobId);
}

export async function getIncomesByAccount(accountId: string) {
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) {
    throw new Error("Cuenta no encontrada");
  }
  return repository.findByAccount(accountId);
}

export async function createIncome(data: CreateIncomeInput) {
  // v1.4.0: Only validate job if jobId is provided (optional for "Ingreso Extra")
  if (data.jobId) {
    const job = await prisma.job.findUnique({ where: { id: data.jobId } });
    if (!job) {
      throw new Error("Trabajo no encontrado");
    }
  }

  const account = await prisma.account.findUnique({
    where: { id: data.accountId },
  });
  if (!account) {
    throw new Error("Cuenta no encontrada");
  }

  const currency = await prisma.currency.findUnique({
    where: { id: data.currencyId },
  });
  if (!currency) {
    throw new Error("Moneda no encontrada");
  }

  // Calculate the amount to add to account
  // If currencies differ, use exchange rate to convert
  let amountToAdd = data.amount;
  if (data.currencyId !== account.currencyId) {
    // Use custom rate if available, otherwise use official rate
    const rate = data.customRate || data.officialRate;
    if (rate && rate > 0) {
      // The rate converts from income currency to account currency
      amountToAdd = data.amount * rate;
    }
  }

  return prisma.$transaction(async (tx) => {
    const income = await tx.income.create({
      data: {
        ...data,
        date: data.date ?? new Date(),
      },
      include: {
        job: true,
        account: true,
        currency: true,
      },
    });

    await tx.account.update({
      where: { id: data.accountId },
      data: {
        balance: { increment: amountToAdd },
      },
    });

    return income;
  });
}

export async function updateIncome(id: string, data: UpdateIncomeInput) {
  const existingIncome = await repository.findById(id);
  if (!existingIncome) {
    throw new Error("Ingreso no encontrado");
  }

  // Get old account to check currency
  const oldAccount = await prisma.account.findUnique({
    where: { id: existingIncome.accountId },
  });

  if (data.jobId) {
    const job = await prisma.job.findUnique({ where: { id: data.jobId } });
    if (!job) {
      throw new Error("Trabajo no encontrado");
    }
  }

  // Get new account if changed
  const newAccountId = data.accountId || existingIncome.accountId;
  const newAccount = await prisma.account.findUnique({
    where: { id: newAccountId },
  });
  if (!newAccount) {
    throw new Error("Cuenta no encontrada");
  }

  if (data.currencyId) {
    const currency = await prisma.currency.findUnique({
      where: { id: data.currencyId },
    });
    if (!currency) {
      throw new Error("Moneda no encontrada");
    }
  }

  // Calculate old amount that was added (with conversion if currencies differed)
  let oldAmountAdded = Number(existingIncome.amount);
  if (oldAccount && existingIncome.currencyId !== oldAccount.currencyId) {
    const oldRate =
      Number(existingIncome.customRate) ||
      Number(existingIncome.officialRate) ||
      1;
    oldAmountAdded = Number(existingIncome.amount) * oldRate;
  }

  return prisma.$transaction(async (tx) => {
    // Revert old amount from old account (with conversion)
    await tx.account.update({
      where: { id: existingIncome.accountId },
      data: {
        balance: { decrement: oldAmountAdded },
      },
    });

    const income = await tx.income.update({
      where: { id },
      data,
      include: {
        job: true,
        account: true,
        currency: true,
      },
    });

    // Calculate new amount to add (with conversion if currencies differ)
    let newAmountToAdd = Number(income.amount);
    if (income.currencyId !== newAccount.currencyId) {
      const newRate =
        Number(income.customRate) || Number(income.officialRate) || 1;
      newAmountToAdd = Number(income.amount) * newRate;
    }

    // Add new amount to new account
    await tx.account.update({
      where: { id: income.accountId },
      data: {
        balance: { increment: newAmountToAdd },
      },
    });

    return income;
  });
}

export async function deleteIncome(id: string) {
  const income = await repository.findById(id);
  if (!income) {
    throw new Error("Ingreso no encontrado");
  }

  // Get account to check currency
  const account = await prisma.account.findUnique({
    where: { id: income.accountId },
  });

  // Calculate amount that was added (with conversion if currencies differed)
  let amountToRevert = Number(income.amount);
  if (account && income.currencyId !== account.currencyId) {
    const rate = Number(income.customRate) || Number(income.officialRate) || 1;
    amountToRevert = Number(income.amount) * rate;
  }

  return prisma.$transaction(async (tx) => {
    await tx.account.update({
      where: { id: income.accountId },
      data: {
        balance: { decrement: amountToRevert },
      },
    });

    return tx.income.delete({ where: { id } });
  });
}

export async function getIncomeSummary(filters?: IncomeFilters) {
  return repository.getSummary(filters);
}

export async function generateIncomeFromJob(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { account: true, currency: true },
  });

  if (!job) {
    throw new Error("Trabajo no encontrado");
  }

  if (job.status !== "active") {
    throw new Error("El trabajo no está activo");
  }

  return createIncome({
    jobId: job.id,
    accountId: job.accountId,
    amount: Number(job.salary),
    currencyId: job.currencyId,
    description: `Pago de ${job.name}`,
  });
}
