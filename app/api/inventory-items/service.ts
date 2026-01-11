import { prisma } from "@/lib/prisma";
import * as repository from "./repository";
import type {
  CreateInventoryItemInput,
  UpdateInventoryItemInput,
  InventoryItemFilters,
  StockAdjustment,
} from "./types";

export async function getInventoryItems(filters?: InventoryItemFilters) {
  return repository.findAll(filters);
}

export async function getInventoryItemById(id: string) {
  const item = await repository.findById(id);
  if (!item) {
    throw new Error("Producto de inventario no encontrado");
  }
  return item;
}

export async function createInventoryItem(data: CreateInventoryItemInput) {
  // v1.3.0: Only validate categoryId if it's provided (not null/undefined)
  if (data.categoryId) {
    const category = await prisma.inventoryCategory.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new Error("Categoria de inventario no encontrada");
    }
  }

  const currency = await prisma.currency.findUnique({
    where: { id: data.currencyId },
  });
  if (!currency) {
    throw new Error("Moneda no encontrada");
  }

  if (data.minQuantity !== undefined && data.maxQuantity < data.minQuantity) {
    throw new Error(
      "La cantidad maxima debe ser mayor o igual a la cantidad minima",
    );
  }

  return repository.create(data);
}

export async function updateInventoryItem(
  id: string,
  data: UpdateInventoryItemInput,
) {
  const item = await repository.findById(id);
  if (!item) {
    throw new Error("Producto de inventario no encontrado");
  }

  if (data.categoryId) {
    const category = await prisma.inventoryCategory.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new Error("Categoria de inventario no encontrada");
    }
  }

  if (data.currencyId) {
    const currency = await prisma.currency.findUnique({
      where: { id: data.currencyId },
    });
    if (!currency) {
      throw new Error("Moneda no encontrada");
    }
  }

  const newMaxQuantity = data.maxQuantity ?? Number(item.maxQuantity);
  const newMinQuantity = data.minQuantity ?? Number(item.minQuantity);

  if (newMaxQuantity < newMinQuantity) {
    throw new Error(
      "La cantidad maxima debe ser mayor o igual a la cantidad minima",
    );
  }

  return repository.update(id, data);
}

export async function deleteInventoryItem(id: string) {
  const item = await repository.findById(id);
  if (!item) {
    throw new Error("Producto de inventario no encontrado");
  }

  return repository.remove(id);
}

export async function adjustStock(id: string, adjustment: StockAdjustment) {
  const item = await repository.findById(id);
  if (!item) {
    throw new Error("Producto de inventario no encontrado");
  }

  if (adjustment.operation === "subtract") {
    const currentQty = Number(item.currentQuantity);
    if (currentQty < adjustment.quantity) {
      throw new Error(
        `No hay suficiente stock. Stock actual: ${currentQty}, intentando restar: ${adjustment.quantity}`,
      );
    }
  }

  return repository.adjustStock(id, adjustment.quantity, adjustment.operation);
}

export async function getLowStockItems() {
  return repository.getLowStockItems();
}

export async function getShoppingList() {
  return repository.getShoppingList();
}
