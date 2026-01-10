import { prisma } from "@/lib/prisma";
import type { UpdateUserConfigInput } from "./schema";

export async function getUserConfig() {
  // Get the first (and only) config entry
  let config = await prisma.userConfig.findFirst({
    include: {
      baseCurrency: true,
    },
  });

  // If no config exists, create a default one
  if (!config) {
    const usdCurrency = await prisma.currency.findFirst({
      where: { isBase: true },
    });

    if (!usdCurrency) {
      throw new Error("No se encontró una moneda base configurada");
    }

    config = await prisma.userConfig.create({
      data: {
        baseCurrencyId: usdCurrency.id,
        dateFormat: "DD/MM/YYYY",
        numberFormat: "es-CO",
        theme: "system",
        sidebarConfig: { items: [] },
      },
      include: {
        baseCurrency: true,
      },
    });
  }

  return config;
}

export async function updateUserConfig(data: UpdateUserConfigInput) {
  const config = await getUserConfig();

  // Validate baseCurrencyId if provided
  if (data.baseCurrencyId) {
    const currency = await prisma.currency.findUnique({
      where: { id: data.baseCurrencyId },
    });
    if (!currency) {
      throw new Error("Moneda no encontrada");
    }
  }

  return prisma.userConfig.update({
    where: { id: config.id },
    data: {
      ...(data.baseCurrencyId && { baseCurrencyId: data.baseCurrencyId }),
      ...(data.dateFormat && { dateFormat: data.dateFormat }),
      ...(data.numberFormat && { numberFormat: data.numberFormat }),
      ...(data.theme && { theme: data.theme }),
      ...(data.sidebarConfig !== undefined && {
        sidebarConfig: data.sidebarConfig,
      }),
    },
    include: {
      baseCurrency: true,
    },
  });
}

export async function updateLastRateSyncAt() {
  const config = await getUserConfig();

  return prisma.userConfig.update({
    where: { id: config.id },
    data: {
      lastRateSyncAt: new Date(),
    },
  });
}

export async function canSyncRates(): Promise<{
  canSync: boolean;
  nextSyncAt?: Date;
  lastSyncAt?: Date;
}> {
  const config = await getUserConfig();

  if (!config.lastRateSyncAt) {
    return { canSync: true };
  }

  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const canSync = config.lastRateSyncAt < sixHoursAgo;

  if (canSync) {
    return { canSync: true, lastSyncAt: config.lastRateSyncAt };
  }

  const nextSyncAt = new Date(
    config.lastRateSyncAt.getTime() + 6 * 60 * 60 * 1000,
  );
  return {
    canSync: false,
    lastSyncAt: config.lastRateSyncAt,
    nextSyncAt,
  };
}
