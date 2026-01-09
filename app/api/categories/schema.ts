import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  parentId: z.string().uuid("ID de categoria padre invalido").optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "El color debe ser un hex valido (ej: #FF5733)")
    .optional(),
  icon: z.string().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido").optional(),
  parentId: z
    .string()
    .uuid("ID de categoria padre invalido")
    .nullable()
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "El color debe ser un hex valido (ej: #FF5733)")
    .optional(),
  icon: z.string().optional(),
});

export type CreateCategorySchema = z.infer<typeof createCategorySchema>;
export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>;
