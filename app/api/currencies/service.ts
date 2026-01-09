import * as repository from "./repository";
import type {
  CreateCurrencyInput,
  UpdateCurrencyInput,
  CurrencyFilters,
} from "./types";

export async function getCurrencies(filters?: CurrencyFilters) {
  return repository.findAll(filters);
}

export async function getCurrencyById(id: string) {
  const currency = await repository.findById(id);
  if (!currency) {
    throw new Error("Moneda no encontrada");
  }
  return currency;
}

export async function getCurrencyByCode(code: string) {
  const currency = await repository.findByCode(code);
  if (!currency) {
    throw new Error("Moneda no encontrada");
  }
  return currency;
}

export async function createCurrency(data: CreateCurrencyInput) {
  const existing = await repository.findByCode(data.code);
  if (existing) {
    throw new Error(`Ya existe una moneda con el codigo ${data.code}`);
  }

  if (data.isBase) {
    const currencies = await repository.findAll({ isBase: true });
    if (currencies.length > 0) {
      throw new Error(
        "Ya existe una moneda base. Usa setAsBase para cambiarla",
      );
    }
  }

  return repository.create(data);
}

export async function updateCurrency(id: string, data: UpdateCurrencyInput) {
  const currency = await repository.findById(id);
  if (!currency) {
    throw new Error("Moneda no encontrada");
  }

  if (data.code && data.code !== currency.code) {
    const existing = await repository.findByCode(data.code);
    if (existing) {
      throw new Error(`Ya existe una moneda con el codigo ${data.code}`);
    }
  }

  return repository.update(id, data);
}

export async function deleteCurrency(id: string) {
  const currency = await repository.findById(id);
  if (!currency) {
    throw new Error("Moneda no encontrada");
  }

  if (currency.isBase) {
    throw new Error("No se puede eliminar la moneda base");
  }

  return repository.remove(id);
}

export async function setBaseCurrency(id: string) {
  const currency = await repository.findById(id);
  if (!currency) {
    throw new Error("Moneda no encontrada");
  }

  const [, updatedCurrency] = await repository.setAsBase(id);
  return updatedCurrency;
}
