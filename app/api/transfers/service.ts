import { prisma } from "@/lib/prisma";
import * as repository from "./repository";
import type {
  CreateTransferInput,
  UpdateTransferInput,
  TransferFilters,
} from "./types";
import type { PaginationParams } from "@/lib/pagination";

export async function getTransfers(filters?: TransferFilters) {
  return repository.findAll(filters);
}

export async function getTransfersPaginated(
  filters?: TransferFilters,
  pagination?: PaginationParams,
) {
  return repository.findAllPaginated(filters, pagination);
}

export async function getTransferById(id: string) {
  const transfer = await repository.findById(id);
  if (!transfer) {
    throw new Error("Transferencia no encontrada");
  }
  return transfer;
}

export async function getTransfersByAccount(accountId: string) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });
  if (!account) {
    throw new Error("Cuenta no encontrada");
  }
  return repository.findByAccount(accountId);
}

export async function createTransfer(data: CreateTransferInput) {
  const fromAccount = await prisma.account.findUnique({
    where: { id: data.fromAccountId },
  });
  if (!fromAccount) {
    throw new Error("Cuenta origen no encontrada");
  }

  const toAccount = await prisma.account.findUnique({
    where: { id: data.toAccountId },
  });
  if (!toAccount) {
    throw new Error("Cuenta destino no encontrada");
  }

  const currency = await prisma.currency.findUnique({
    where: { id: data.currencyId },
  });
  if (!currency) {
    throw new Error("Moneda no encontrada");
  }

  if (data.fromAccountId === data.toAccountId) {
    throw new Error("La cuenta origen y destino deben ser diferentes");
  }

  // Calculate destination amount based on exchange rate
  const destinationAmount = data.exchangeRate
    ? data.amount * data.exchangeRate
    : data.amount;

  return prisma.$transaction(async (tx) => {
    const transfer = await tx.transfer.create({
      data: {
        ...data,
        date: data.date ?? new Date(),
      },
      include: {
        fromAccount: true,
        toAccount: true,
        currency: true,
      },
    });

    // Deduct from source account
    await tx.account.update({
      where: { id: data.fromAccountId },
      data: {
        balance: { decrement: data.amount },
      },
    });

    // Add to destination account
    await tx.account.update({
      where: { id: data.toAccountId },
      data: {
        balance: { increment: destinationAmount },
      },
    });

    return transfer;
  });
}

export async function updateTransfer(id: string, data: UpdateTransferInput) {
  const existingTransfer = await repository.findById(id);
  if (!existingTransfer) {
    throw new Error("Transferencia no encontrada");
  }

  if (data.fromAccountId) {
    const fromAccount = await prisma.account.findUnique({
      where: { id: data.fromAccountId },
    });
    if (!fromAccount) {
      throw new Error("Cuenta origen no encontrada");
    }
  }

  if (data.toAccountId) {
    const toAccount = await prisma.account.findUnique({
      where: { id: data.toAccountId },
    });
    if (!toAccount) {
      throw new Error("Cuenta destino no encontrada");
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

  // Calculate old destination amount
  const oldDestinationAmount = existingTransfer.exchangeRate
    ? Number(existingTransfer.amount) * Number(existingTransfer.exchangeRate)
    : Number(existingTransfer.amount);

  return prisma.$transaction(async (tx) => {
    // Revert old transfer
    await tx.account.update({
      where: { id: existingTransfer.fromAccountId },
      data: {
        balance: { increment: Number(existingTransfer.amount) },
      },
    });

    await tx.account.update({
      where: { id: existingTransfer.toAccountId },
      data: {
        balance: { decrement: oldDestinationAmount },
      },
    });

    const transfer = await tx.transfer.update({
      where: { id },
      data,
      include: {
        fromAccount: true,
        toAccount: true,
        currency: true,
      },
    });

    // Calculate new destination amount
    const newDestinationAmount = transfer.exchangeRate
      ? Number(transfer.amount) * Number(transfer.exchangeRate)
      : Number(transfer.amount);

    // Apply new transfer
    await tx.account.update({
      where: { id: transfer.fromAccountId },
      data: {
        balance: { decrement: Number(transfer.amount) },
      },
    });

    await tx.account.update({
      where: { id: transfer.toAccountId },
      data: {
        balance: { increment: newDestinationAmount },
      },
    });

    return transfer;
  });
}

export async function deleteTransfer(id: string) {
  const transfer = await repository.findById(id);
  if (!transfer) {
    throw new Error("Transferencia no encontrada");
  }

  // Calculate destination amount that was added
  const destinationAmount = transfer.exchangeRate
    ? Number(transfer.amount) * Number(transfer.exchangeRate)
    : Number(transfer.amount);

  return prisma.$transaction(async (tx) => {
    // Revert from source account
    await tx.account.update({
      where: { id: transfer.fromAccountId },
      data: {
        balance: { increment: Number(transfer.amount) },
      },
    });

    // Revert from destination account
    await tx.account.update({
      where: { id: transfer.toAccountId },
      data: {
        balance: { decrement: destinationAmount },
      },
    });

    return tx.transfer.delete({ where: { id } });
  });
}

export async function getTransferSummary(filters?: TransferFilters) {
  return repository.getSummary(filters);
}
