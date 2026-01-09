import { z } from "zod";

export const createInventoryCategorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  icon: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "El color debe ser un hex valido (ej: #FF5733)")
    .optional(),
  description: z.string().optional(),
});

export const updateInventoryCategorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido").optional(),
  icon: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "El color debe ser un hex valido (ej: #FF5733)")
    .optional(),
  description: z.string().optional(),
});

export type CreateInventoryCategorySchema = z.infer<
  typeof createInventoryCategorySchema
>;
export type UpdateInventoryCategorySchema = z.infer<
  typeof updateInventoryCategorySchema
>;
