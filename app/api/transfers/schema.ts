import { z } from "zod";

export const createTransferSchema = z
  .object({
    fromAccountId: z.string().uuid("ID de cuenta origen inválido"),
    toAccountId: z.string().uuid("ID de cuenta destino inválido"),
    amount: z.number().positive("El monto debe ser positivo"),
    currencyId: z.string().uuid("ID de moneda inválido"),
    exchangeRate: z.number().positive().optional(),
    date: z.coerce.date().optional(),
    description: z.string().max(500).optional(),
  })
  .refine((data) => data.fromAccountId !== data.toAccountId, {
    message: "La cuenta origen y destino deben ser diferentes",
    path: ["toAccountId"],
  });

export const updateTransferSchema = z.object({
  fromAccountId: z.string().uuid("ID de cuenta origen inválido").optional(),
  toAccountId: z.string().uuid("ID de cuenta destino inválido").optional(),
  amount: z.number().positive("El monto debe ser positivo").optional(),
  currencyId: z.string().uuid("ID de moneda inválido").optional(),
  exchangeRate: z.number().positive().nullable().optional(),
  date: z.coerce.date().optional(),
  description: z.string().max(500).nullable().optional(),
});

export const transferFiltersSchema = z.object({
  fromAccountId: z.string().uuid().optional(),
  toAccountId: z.string().uuid().optional(),
  currencyId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});
