import { z } from "zod";

const inventoryUnitEnum = z.enum([
  "unidades",
  "kg",
  "g",
  "L",
  "mL",
  "paquetes",
]);

export const createInventoryItemSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  // categoryId is optional (nullable)
  categoryId: z.string().uuid("ID de categoria invalido").nullable().optional(),
  currentQuantity: z
    .number()
    .min(0, "La cantidad no puede ser negativa")
    .default(0),
  maxQuantity: z.number().positive("La cantidad maxima debe ser mayor a 0"),
  minQuantity: z
    .number()
    .min(0, "La cantidad minima no puede ser negativa")
    .default(0),
  unit: inventoryUnitEnum.default("unidades"),
  // estimatedPrice defaults to 0 if not provided
  estimatedPrice: z
    .number()
    .min(0, "El precio no puede ser negativo")
    .default(0),
  currencyId: z.string().uuid("ID de moneda invalido"),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
});

export const updateInventoryItemSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").optional(),
  // categoryId can be null to remove category
  categoryId: z.string().uuid("ID de categoria invalido").nullable().optional(),
  currentQuantity: z
    .number()
    .min(0, "La cantidad no puede ser negativa")
    .optional(),
  maxQuantity: z
    .number()
    .positive("La cantidad maxima debe ser mayor a 0")
    .optional(),
  minQuantity: z
    .number()
    .min(0, "La cantidad minima no puede ser negativa")
    .optional(),
  unit: inventoryUnitEnum.optional(),
  estimatedPrice: z
    .number()
    .min(0, "El precio no puede ser negativo")
    .optional(),
  currencyId: z.string().uuid("ID de moneda invalido").optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
});

export const stockAdjustmentSchema = z.object({
  quantity: z.number().min(0, "La cantidad no puede ser negativa"),
  operation: z.enum(["add", "subtract", "set"]),
});

export type CreateInventoryItemSchema = z.infer<
  typeof createInventoryItemSchema
>;
export type UpdateInventoryItemSchema = z.infer<
  typeof updateInventoryItemSchema
>;
export type StockAdjustmentSchema = z.infer<typeof stockAdjustmentSchema>;
