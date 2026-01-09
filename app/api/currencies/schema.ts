import { z } from "zod";

export const createCurrencySchema = z.object({
  code: z
    .string()
    .min(3, "El codigo debe tener al menos 3 caracteres")
    .max(3, "El codigo debe tener maximo 3 caracteres")
    .toUpperCase(),
  name: z.string().min(1, "El nombre es requerido"),
  symbol: z.string().min(1, "El simbolo es requerido"),
  isBase: z.boolean().default(false),
});

export const updateCurrencySchema = z.object({
  code: z
    .string()
    .min(3, "El codigo debe tener al menos 3 caracteres")
    .max(3, "El codigo debe tener maximo 3 caracteres")
    .toUpperCase()
    .optional(),
  name: z.string().min(1, "El nombre es requerido").optional(),
  symbol: z.string().min(1, "El simbolo es requerido").optional(),
  isBase: z.boolean().optional(),
});

export type CreateCurrencySchema = z.infer<typeof createCurrencySchema>;
export type UpdateCurrencySchema = z.infer<typeof updateCurrencySchema>;
