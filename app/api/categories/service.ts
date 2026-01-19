import * as repository from "./repository";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryFilters,
} from "./types";

export async function getCategories(filters?: CategoryFilters) {
  return repository.findAll(filters);
}

export async function getCategoryById(id: string, userId?: string | null) {
  const category = await repository.findById(id, userId);
  if (!category) {
    throw new Error("Categoria no encontrada");
  }
  return category;
}

export async function getCategoryTree(userId?: string | null) {
  return repository.getTree(userId);
}

export async function createCategory(data: CreateCategoryInput) {
  if (data.parentId) {
    const parent = await repository.findById(data.parentId, data.userId);
    if (!parent) {
      throw new Error("Categoria padre no encontrada");
    }
  }

  const existing = await repository.findByName(data.name, data.parentId, data.userId);
  if (existing) {
    throw new Error(
      `Ya existe una categoria con el nombre "${data.name}" en este nivel`,
    );
  }

  return repository.create(data);
}

export async function updateCategory(id: string, data: UpdateCategoryInput, userId?: string | null) {
  const category = await repository.findById(id, userId);
  if (!category) {
    throw new Error("Categoria no encontrada");
  }

  if (data.parentId === id) {
    throw new Error("Una categoria no puede ser su propio padre");
  }

  if (data.parentId) {
    const parent = await repository.findById(data.parentId, userId);
    if (!parent) {
      throw new Error("Categoria padre no encontrada");
    }
  }

  if (data.name && data.name !== category.name) {
    const parentId =
      data.parentId !== undefined ? data.parentId : category.parentId;
    const existing = await repository.findByName(data.name, parentId, userId);
    if (existing && existing.id !== id) {
      throw new Error(
        `Ya existe una categoria con el nombre "${data.name}" en este nivel`,
      );
    }
  }

  return repository.update(id, data, userId);
}

export async function deleteCategory(id: string, userId?: string | null) {
  const category = await repository.findById(id, userId);
  if (!category) {
    throw new Error("Categoria no encontrada");
  }

  if (category.children && category.children.length > 0) {
    throw new Error(
      "No se puede eliminar una categoria con subcategorias. Elimina primero las subcategorias",
    );
  }

  return repository.remove(id, userId);
}
