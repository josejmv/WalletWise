import { prisma } from "@/lib/prisma";
import * as repository from "./repository";
import type { CreateJobInput, UpdateJobInput, JobFilters } from "./types";

export async function getJobs(filters?: JobFilters) {
  return repository.findAll(filters);
}

export async function getActiveJobs() {
  return repository.findActive();
}

export async function getJobById(id: string) {
  const job = await repository.findById(id);
  if (!job) {
    throw new Error("Trabajo no encontrado");
  }
  return job;
}

export async function createJob(data: CreateJobInput) {
  const currency = await prisma.currency.findUnique({
    where: { id: data.currencyId },
  });
  if (!currency) {
    throw new Error("Moneda no encontrada");
  }

  const account = await prisma.account.findUnique({
    where: { id: data.accountId },
  });
  if (!account) {
    throw new Error("Cuenta no encontrada");
  }

  if (data.periodicity !== "one_time" && !data.payDay) {
    throw new Error("El dia de pago es requerido para trabajos recurrentes");
  }

  if (data.periodicity === "one_time" && data.payDay) {
    throw new Error("El dia de pago no aplica para trabajos de pago unico");
  }

  return repository.create(data);
}

export async function updateJob(id: string, data: UpdateJobInput) {
  const job = await repository.findById(id);
  if (!job) {
    throw new Error("Trabajo no encontrado");
  }

  if (data.currencyId) {
    const currency = await prisma.currency.findUnique({
      where: { id: data.currencyId },
    });
    if (!currency) {
      throw new Error("Moneda no encontrada");
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

  const newPeriodicity = data.periodicity ?? job.periodicity;
  const newPayDay = data.payDay !== undefined ? data.payDay : job.payDay;

  if (newPeriodicity !== "one_time" && !newPayDay) {
    throw new Error("El dia de pago es requerido para trabajos recurrentes");
  }

  return repository.update(id, data);
}

export async function deleteJob(id: string) {
  const job = await repository.findById(id);
  if (!job) {
    throw new Error("Trabajo no encontrado");
  }

  if (job.incomes && job.incomes.length > 0) {
    throw new Error(
      "No se puede eliminar un trabajo con ingresos registrados. Archivalo en su lugar",
    );
  }

  return repository.remove(id);
}

export async function archiveJob(id: string) {
  const job = await repository.findById(id);
  if (!job) {
    throw new Error("Trabajo no encontrado");
  }

  if (job.status === "archived") {
    throw new Error("El trabajo ya esta archivado");
  }

  return repository.archive(id);
}

export async function activateJob(id: string) {
  const job = await repository.findById(id);
  if (!job) {
    throw new Error("Trabajo no encontrado");
  }

  if (job.status === "active") {
    throw new Error("El trabajo ya esta activo");
  }

  return repository.activate(id);
}

export async function getTotalMonthlyIncome() {
  return repository.getTotalMonthlyIncome();
}
