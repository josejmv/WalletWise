import { z } from "zod";

const budgetTypeEnum = z.enum(["goal", "envelope"]);
const budgetStatusEnum = z.enum(["active", "completed", "cancelled"]);

export const createBudgetSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: budgetTypeEnum,
  // v1.3.0: targetAmount is optional (budgets without goal)
  targetAmount: z
    .number()
    .positive("El monto objetivo debe ser mayor a 0")
    .nullable()
    .optional(),
  currentAmount: z
    .number()
    .min(0, "El monto actual no puede ser negativo")
    .default(0),
  currencyId: z.string().uuid("ID de moneda invalido"),
  accountId: z.string().uuid("ID de cuenta invalido"), // Ahora requerido
  deadline: z.coerce.date().optional(),
  status: budgetStatusEnum.default("active"),
});

export const updateBudgetSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").optional(),
  type: budgetTypeEnum.optional(),
  targetAmount: z
    .number()
    .positive("El monto objetivo debe ser mayor a 0")
    .optional(),
  currentAmount: z
    .number()
    .min(0, "El monto actual no puede ser negativo")
    .optional(),
  currencyId: z.string().uuid("ID de moneda invalido").optional(),
  accountId: z.string().uuid("ID de cuenta invalido").optional(),
  deadline: z.coerce.date().nullable().optional(),
  status: budgetStatusEnum.optional(),
});

export const contributeSchema = z.object({
  amount: z.number().positive("El monto debe ser mayor a 0"),
  fromAccountId: z.string().uuid("ID de cuenta invalido"),
  description: z.string().optional(),
});

export const withdrawSchema = z.object({
  amount: z.number().positive("El monto debe ser mayor a 0"),
  toAccountId: z.string().uuid("ID de cuenta invalido"),
  description: z.string().optional(),
});

export type CreateBudgetSchema = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetSchema = z.infer<typeof updateBudgetSchema>;
export type ContributeSchema = z.infer<typeof contributeSchema>;
export type WithdrawSchema = z.infer<typeof withdrawSchema>;
