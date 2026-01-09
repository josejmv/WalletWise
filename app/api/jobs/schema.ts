import { z } from "zod";

const jobTypeEnum = z.enum(["fixed", "freelance"]);
const jobPeriodicityEnum = z.enum(["biweekly", "monthly", "one_time"]);
const jobStatusEnum = z.enum(["active", "archived", "pending"]);

export const createJobSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: jobTypeEnum,
  salary: z.number().positive("El salario debe ser mayor a 0"),
  currencyId: z.string().uuid("ID de moneda invalido"),
  accountId: z.string().uuid("ID de cuenta invalido"),
  periodicity: jobPeriodicityEnum,
  payDay: z
    .number()
    .int()
    .min(1, "El dia de pago debe ser entre 1 y 31")
    .max(31, "El dia de pago debe ser entre 1 y 31")
    .optional(),
  status: jobStatusEnum.default("active"),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const updateJobSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").optional(),
  type: jobTypeEnum.optional(),
  salary: z.number().positive("El salario debe ser mayor a 0").optional(),
  currencyId: z.string().uuid("ID de moneda invalido").optional(),
  accountId: z.string().uuid("ID de cuenta invalido").optional(),
  periodicity: jobPeriodicityEnum.optional(),
  payDay: z
    .number()
    .int()
    .min(1, "El dia de pago debe ser entre 1 y 31")
    .max(31, "El dia de pago debe ser entre 1 y 31")
    .nullable()
    .optional(),
  status: jobStatusEnum.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().nullable().optional(),
});

export type CreateJobSchema = z.infer<typeof createJobSchema>;
export type UpdateJobSchema = z.infer<typeof updateJobSchema>;
