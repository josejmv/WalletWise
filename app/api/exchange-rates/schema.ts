import { z } from "zod";

const exchangeRateSourceSchema = z.enum(["official", "binance", "manual"]);

export const createExchangeRateSchema = z.object({
  fromCurrencyId: z.string().uuid("ID de moneda origen invalido"),
  toCurrencyId: z.string().uuid("ID de moneda destino invalido"),
  rate: z.number().positive("La tasa debe ser mayor a 0"),
  source: exchangeRateSourceSchema.optional().default("manual"),
});

export const updateExchangeRateSchema = z.object({
  rate: z.number().positive("La tasa debe ser mayor a 0"),
  source: exchangeRateSourceSchema.optional(),
});

export const convertSchema = z.object({
  fromCurrencyId: z.string().uuid("ID de moneda origen invalido"),
  toCurrencyId: z.string().uuid("ID de moneda destino invalido"),
  amount: z.number().positive("El monto debe ser mayor a 0"),
});

export type CreateExchangeRateSchema = z.infer<typeof createExchangeRateSchema>;
export type UpdateExchangeRateSchema = z.infer<typeof updateExchangeRateSchema>;
export type ConvertSchema = z.infer<typeof convertSchema>;
