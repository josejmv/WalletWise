import { z } from "zod";

export const createPriceHistorySchema = z.object({
  itemId: z.string().uuid("ID de producto invalido"),
  price: z.number().positive("El precio debe ser mayor a 0"),
  currencyId: z.string().uuid("ID de moneda invalido"),
  date: z.coerce.date().optional(),
  source: z.string().optional(),
});

export const batchCreatePriceHistorySchema = z.object({
  entries: z.array(
    z.object({
      itemId: z.string().uuid("ID de producto invalido"),
      price: z.number().positive("El precio debe ser mayor a 0"),
      currencyId: z.string().uuid("ID de moneda invalido"),
      date: z.coerce.date().optional(),
      source: z.string().optional(),
    }),
  ),
});

export type CreatePriceHistorySchema = z.infer<typeof createPriceHistorySchema>;
export type BatchCreatePriceHistorySchema = z.infer<
  typeof batchCreatePriceHistorySchema
>;
