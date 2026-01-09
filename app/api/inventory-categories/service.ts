import * as repository from "./repository";
import type {
  CreateInventoryCategoryInput,
  UpdateInventoryCategoryInput,
} from "./types";

export async function getInventoryCategories() {
  return repository.findAll();
}

export async function getInventoryCategoryById(id: string) {
  const category = await repository.findById(id);
  if (!category) {
    throw new Error("Categoria de inventario no encontrada");
  }
  return category;
}

export async function createInventoryCategory(
  data: CreateInventoryCategoryInput,
) {
  const existing = await repository.findByName(data.name);
  if (existing) {
    throw new Error(`Ya existe una categoria con el nombre "${data.name}"`);
  }

  return repository.create(data);
}

export async function updateInventoryCategory(
  id: string,
  data: UpdateInventoryCategoryInput,
) {
  const category = await repository.findById(id);
  if (!category) {
    throw new Error("Categoria de inventario no encontrada");
  }

  if (data.name && data.name !== category.name) {
    const existing = await repository.findByName(data.name);
    if (existing) {
      throw new Error(`Ya existe una categoria con el nombre "${data.name}"`);
    }
  }

  return repository.update(id, data);
}

export async function deleteInventoryCategory(id: string) {
  const category = await repository.findById(id);
  if (!category) {
    throw new Error("Categoria de inventario no encontrada");
  }

  if (category.items && category.items.length > 0) {
    throw new Error(
      "No se puede eliminar una categoria con productos. Mueve o elimina los productos primero",
    );
  }

  return repository.remove(id);
}
