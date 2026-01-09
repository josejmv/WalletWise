import { z } from "zod";

export const generateShoppingListSchema = z.object({
  name: z.string().max(100).optional(),
  includeAll: z.boolean().optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  priorityThreshold: z.enum(["high", "medium", "low"]).optional(),
});

export const updateShoppingListItemSchema = z.object({
  isPurchased: z.boolean().optional(),
  actualPrice: z.number().positive().optional(),
  actualQuantity: z.number().positive().optional(),
});
