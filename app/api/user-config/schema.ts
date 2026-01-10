import { z } from "zod";

export const updateUserConfigSchema = z.object({
  baseCurrencyId: z.string().uuid().optional(),
  dateFormat: z.enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]).optional(),
  numberFormat: z.enum(["es-CO", "en-US"]).optional(),
  theme: z.enum(["system", "light", "dark"]).optional(),
  sidebarConfig: z.any().optional(),
});

export type UpdateUserConfigInput = z.infer<typeof updateUserConfigSchema>;
