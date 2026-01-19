import * as repository from "./repository";
import type {
  CreateInventoryCategoryInput,
  UpdateInventoryCategoryInput,
} from "./types";

export async function getInventoryCategories(userId?: string | null) {
  return repository.findAll({ userId });
}

export async function getInventoryCategoryById(id: string, userId?: string | null) {
  const category = await repository.findById(id, userId);
  if (!category) {
    throw new Error("Categoria de inventario no encontrada");
  }
  return category;
}

export async function createInventoryCategory(
  data: CreateInventoryCategoryInput,
  userId?: string | null,
) {
  const existing = await repository.findByName(data.name, userId);
  if (existing) {
    throw new Error(`Ya existe una categoria con el nombre "${data.name}"`);
  }

  return repository.create({ ...data, userId });
}

export async function updateInventoryCategory(
  id: string,
  data: UpdateInventoryCategoryInput,
  userId?: string | null,
) {
  const category = await repository.findById(id, userId);
  if (!category) {
    throw new Error("Categoria de inventario no encontrada");
  }

  if (data.name && data.name !== category.name) {
    const existing = await repository.findByName(data.name, userId);
    if (existing) {
      throw new Error(`Ya existe una categoria con el nombre "${data.name}"`);
    }
  }

  return repository.update(id, data, userId);
}

export async function deleteInventoryCategory(id: string, userId?: string | null) {
  const category = await repository.findById(id, userId);
  if (!category) {
    throw new Error("Categoria de inventario no encontrada");
  }

  if (category.items && category.items.length > 0) {
    throw new Error(
      "No se puede eliminar una categoria con productos. Mueve o elimina los productos primero",
    );
  }

  return repository.remove(id, userId);
}
