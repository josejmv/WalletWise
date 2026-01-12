import { z } from "zod";

export const createIncomeSchema = z.object({
  // v1.4.0: jobId is optional - null means "Ingreso Extra"
  jobId: z.string().uuid("ID de trabajo inválido").nullable().optional(),
  accountId: z.string().uuid("ID de cuenta inválido"),
  amount: z.number().positive("El monto debe ser positivo"),
  currencyId: z.string().uuid("ID de moneda inválido"),
  officialRate: z.number().positive().optional(),
  customRate: z.number().positive().optional(),
  date: z.coerce.date().optional(),
  description: z.string().max(500).optional(),
});

export const updateIncomeSchema = z.object({
  // v1.4.0: jobId can be set to null
  jobId: z.string().uuid("ID de trabajo inválido").nullable().optional(),
  accountId: z.string().uuid("ID de cuenta inválido").optional(),
  amount: z.number().positive("El monto debe ser positivo").optional(),
  currencyId: z.string().uuid("ID de moneda inválido").optional(),
  officialRate: z.number().positive().nullable().optional(),
  customRate: z.number().positive().nullable().optional(),
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
