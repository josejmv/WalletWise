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
  const job = await prisma.job.findUnique({ where: { id: data.jobId } });
  if (!job) {
    throw new Error("Trabajo no encontrado");
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
        balance: { increment: data.amount },
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

  if (data.jobId) {
    const job = await prisma.job.findUnique({ where: { id: data.jobId } });
    if (!job) {
      throw new Error("Trabajo no encontrado");
    }
  }

  if (data.accountId) {
    const account = await prisma.account.findUnique({
      where: { id: data.accountId },
    });
    if (!account) {
      throw new Error("Cuenta no encontrada");
    }
  }

  if (data.currencyId) {
    const currency = await prisma.currency.findUnique({
      where: { id: data.currencyId },
    });
    if (!currency) {
      throw new Error("Moneda no encontrada");
    }
  }

  return prisma.$transaction(async (tx) => {
    // Revert old amount from old account
    await tx.account.update({
      where: { id: existingIncome.accountId },
      data: {
        balance: { decrement: Number(existingIncome.amount) },
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

    // Add new amount to new account
    await tx.account.update({
      where: { id: income.accountId },
      data: {
        balance: { increment: Number(income.amount) },
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

  return prisma.$transaction(async (tx) => {
    await tx.account.update({
      where: { id: income.accountId },
      data: {
        balance: { decrement: Number(income.amount) },
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
