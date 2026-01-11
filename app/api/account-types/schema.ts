import { z } from "zod";

const accountTypeEnum = z.enum([
  "bank",
  "cash",
  "digital_wallet",
  "credit_card",
]);

export const createAccountTypeSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: accountTypeEnum,
  description: z.string().optional(),
});

export const updateAccountTypeSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").optional(),
  description: z.string().optional(),
  // v1.3.0: Allow toggling active status
  isActive: z.boolean().optional(),
});

export type CreateAccountTypeSchema = z.infer<typeof createAccountTypeSchema>;
export type UpdateAccountTypeSchema = z.infer<typeof updateAccountTypeSchema>;
