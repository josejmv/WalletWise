import { z } from "zod";

const periodicityEnum = z.enum(["weekly", "monthly", "yearly"]);

export const createExpenseSchema = z
  .object({
    categoryId: z.string().uuid("ID de categoría inválido"),
    accountId: z.string().uuid("ID de cuenta inválido"),
    amount: z.number().positive("El monto debe ser positivo"),
    currencyId: z.string().uuid("ID de moneda inválido"),
    officialRate: z.number().positive().optional(),
    customRate: z.number().positive().optional(),
    isRecurring: z.boolean().optional(),
    periodicity: periodicityEnum.optional(),
    nextDueDate: z.coerce.date().optional(),
    date: z.coerce.date().optional(),
    description: z.string().max(500).optional(),
    // Change (vuelto) system
    hasChange: z.boolean().optional(),
    changeAmount: z.number().positive("El vuelto debe ser positivo").optional(),
    changeAccountId: z.string().uuid("ID de cuenta de vuelto inválido").optional(),
    changeCurrencyId: z.string().uuid("ID de moneda de vuelto inválido").optional(),
  })
  .refine(
    (data) => {
      if (data.isRecurring && !data.periodicity) {
        return false;
      }
      return true;
    },
    {
      message: "La periodicidad es requerida para gastos recurrentes",
      path: ["periodicity"],
    },
  )
  // Validate change amount is provided when hasChange is true
  .refine(
    (data) => {
      if (data.hasChange && !data.changeAmount) {
        return false;
      }
      return true;
    },
    {
      message: "El monto del vuelto es requerido",
      path: ["changeAmount"],
    },
  );

export const updateExpenseSchema = z.object({
  categoryId: z.string().uuid("ID de categoría inválido").optional(),
  accountId: z.string().uuid("ID de cuenta inválido").optional(),
  amount: z.number().positive("El monto debe ser positivo").optional(),
  currencyId: z.string().uuid("ID de moneda inválido").optional(),
  officialRate: z.number().positive().nullable().optional(),
  customRate: z.number().positive().nullable().optional(),
  isRecurring: z.boolean().optional(),
  periodicity: periodicityEnum.nullable().optional(),
  nextDueDate: z.coerce.date().nullable().optional(),
  date: z.coerce.date().optional(),
  description: z.string().max(500).nullable().optional(),
  // Change (vuelto) system
  hasChange: z.boolean().optional(),
  changeAmount: z.number().positive().nullable().optional(),
  changeAccountId: z.string().uuid().nullable().optional(),
  changeCurrencyId: z.string().uuid().nullable().optional(),
});

export const expenseFiltersSchema = z.object({
  categoryId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  currencyId: z.string().uuid().optional(),
  isRecurring: z.coerce.boolean().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});
