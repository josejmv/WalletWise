import { z } from "zod";

export const createIncomeSchema = z.object({
  jobId: z.string().uuid("ID de trabajo inválido"),
  accountId: z.string().uuid("ID de cuenta inválido"),
  amount: z.number().positive("El monto debe ser positivo"),
  currencyId: z.string().uuid("ID de moneda inválido"),
  date: z.coerce.date().optional(),
  description: z.string().max(500).optional(),
});

export const updateIncomeSchema = z.object({
  jobId: z.string().uuid("ID de trabajo inválido").optional(),
  accountId: z.string().uuid("ID de cuenta inválido").optional(),
  amount: z.number().positive("El monto debe ser positivo").optional(),
  currencyId: z.string().uuid("ID de moneda inválido").optional(),
  date: z.coerce.date().optional(),
  description: z.string().max(500).nullable().optional(),
});

export const incomeFiltersSchema = z.object({
  jobId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  currencyId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});
