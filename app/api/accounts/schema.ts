import { z } from "zod";

export const createAccountSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  accountTypeId: z.string().uuid("ID de tipo de cuenta invalido"),
  currencyId: z.string().uuid("ID de moneda invalido"),
  balance: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").optional(),
  accountTypeId: z.string().uuid("ID de tipo de cuenta invalido").optional(),
  currencyId: z.string().uuid("ID de moneda invalido").optional(),
  balance: z.number().optional(),
  isActive: z.boolean().optional(),
});

export type CreateAccountSchema = z.infer<typeof createAccountSchema>;
export type UpdateAccountSchema = z.infer<typeof updateAccountSchema>;
