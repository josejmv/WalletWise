import { z } from "zod";

export const createIncomeSchema = z
  .object({
    // jobId is optional - null means "Ingreso Extra"
    jobId: z.string().uuid("ID de trabajo inválido").nullable().optional(),
    accountId: z.string().uuid("ID de cuenta inválido"),
    amount: z.number().positive("El monto debe ser positivo"),
    currencyId: z.string().uuid("ID de moneda inválido"),
    officialRate: z.number().positive().optional(),
    customRate: z.number().positive().optional(),
    date: z.coerce.date().optional(),
    description: z.string().max(500).optional(),
    // Change (vuelto) system
    hasChange: z.boolean().optional(),
    changeAmount: z.number().positive("El vuelto debe ser positivo").optional(),
    changeAccountId: z.string().uuid("ID de cuenta de vuelto inválido").optional(),
    changeCurrencyId: z.string().uuid("ID de moneda de vuelto inválido").optional(),
  })
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

export const updateIncomeSchema = z.object({
  // jobId can be set to null
  jobId: z.string().uuid("ID de trabajo inválido").nullable().optional(),
  accountId: z.string().uuid("ID de cuenta inválido").optional(),
  amount: z.number().positive("El monto debe ser positivo").optional(),
  currencyId: z.string().uuid("ID de moneda inválido").optional(),
  officialRate: z.number().positive().nullable().optional(),
  customRate: z.number().positive().nullable().optional(),
  date: z.coerce.date().optional(),
  description: z.string().max(500).nullable().optional(),
  // Change (vuelto) system
  hasChange: z.boolean().optional(),
  changeAmount: z.number().positive().nullable().optional(),
  changeAccountId: z.string().uuid().nullable().optional(),
  changeCurrencyId: z.string().uuid().nullable().optional(),
});

export const incomeFiltersSchema = z.object({
  jobId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  currencyId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});
