import type {
  InventoryPriceHistory,
  InventoryItem,
  Currency,
} from "@prisma/client";

export type { InventoryPriceHistory };

export interface InventoryPriceHistoryWithRelations extends InventoryPriceHistory {
  item: InventoryItem;
  currency: Currency;
}

export interface CreatePriceHistoryInput {
  itemId: string;
  price: number;
  currencyId: string;
  date?: Date;
  source?: string;
}

export interface PriceHistoryFilters {
  itemId?: string;
  currencyId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface PriceStats {
  itemId: string;
  itemName: string;
  currentPrice: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  priceChange: number;
  priceChangePercent: number;
}
