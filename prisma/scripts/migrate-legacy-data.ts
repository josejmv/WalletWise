/**
 * Script para migrar datos legacy (userId = null) a un usuario específico
 *
 * Uso:
 *   npx tsx prisma/scripts/migrate-legacy-data.ts check
 *     - Muestra datos legacy pendientes de migrar
 *
 *   npx tsx prisma/scripts/migrate-legacy-data.ts users
 *     - Lista todos los usuarios registrados con sus IDs
 *
 *   npx tsx prisma/scripts/migrate-legacy-data.ts migrate <userId>
 *     - Migra todos los datos legacy al usuario especificado
 *
 * Ejemplo:
 *   DATABASE_URL="postgresql://..." npx tsx prisma/scripts/migrate-legacy-data.ts check
 *   DATABASE_URL="postgresql://..." npx tsx prisma/scripts/migrate-legacy-data.ts migrate "abc123-uuid"
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface MigrationTask {
  name: string;
  migrate: () => Promise<{ count: number }>;
}

async function migrateLegacyData(targetUserId: string): Promise<void> {
  console.log(`\n🚀 Migrando datos legacy al usuario: ${targetUserId}\n`);

  // Verificar que el usuario existe
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!user) {
    throw new Error(`Usuario con ID ${targetUserId} no encontrado`);
  }

  console.log(`✅ Usuario encontrado: ${user.email}\n`);

  // Tablas a migrar (en orden por dependencias)
  const migrations: MigrationTask[] = [
    {
      name: "Accounts",
      migrate: () =>
        prisma.account.updateMany({
          where: { userId: null },
          data: { userId: targetUserId },
        }),
    },
    {
      name: "Jobs",
      migrate: () =>
        prisma.job.updateMany({
          where: { userId: null },
          data: { userId: targetUserId },
        }),
    },
    {
      name: "Categories",
      migrate: () =>
        prisma.category.updateMany({
          where: { userId: null },
          data: { userId: targetUserId },
        }),
    },
    {
      name: "Incomes",
      migrate: () =>
        prisma.income.updateMany({
          where: { userId: null },
          data: { userId: targetUserId },
        }),
    },
    {
      name: "Expenses",
      migrate: () =>
        prisma.expense.updateMany({
          where: { userId: null },
          data: { userId: targetUserId },
        }),
    },
    {
      name: "Transfers",
      migrate: () =>
        prisma.transfer.updateMany({
          where: { userId: null },
          data: { userId: targetUserId },
        }),
    },
    {
      name: "Budgets",
      migrate: () =>
        prisma.budget.updateMany({
          where: { userId: null },
          data: { userId: targetUserId },
        }),
    },
    {
      name: "Budget Contributions",
      migrate: () =>
        prisma.budgetContribution.updateMany({
          where: { userId: null },
          data: { userId: targetUserId },
        }),
    },
    {
      name: "Inventory Categories",
      migrate: () =>
        prisma.inventoryCategory.updateMany({
          where: { userId: null },
          data: { userId: targetUserId },
        }),
    },
    {
      name: "Inventory Items",
      migrate: () =>
        prisma.inventoryItem.updateMany({
          where: { userId: null },
          data: { userId: targetUserId },
        }),
    },
    {
      name: "User Config",
      migrate: () =>
        prisma.userConfig.updateMany({
          where: { userId: null },
          data: { userId: targetUserId },
        }),
    },
  ];

  // Ejecutar migraciones
  for (const { name, migrate } of migrations) {
    try {
      const result = await migrate();
      console.log(`  ✅ ${name}: ${result.count} registros migrados`);
    } catch (error) {
      console.error(`  ❌ ${name}: Error -`, error);
      throw error;
    }
  }

  console.log("\n✅ Migración completada exitosamente!\n");

  // Mostrar resumen
  await showSummary(targetUserId);
}

async function showSummary(userId: string): Promise<void> {
  console.log("📊 Resumen de datos del usuario:\n");

  const counts = await Promise.all([
    prisma.account.count({ where: { userId } }),
    prisma.job.count({ where: { userId } }),
    prisma.category.count({ where: { userId } }),
    prisma.income.count({ where: { userId } }),
    prisma.expense.count({ where: { userId } }),
    prisma.transfer.count({ where: { userId } }),
    prisma.budget.count({ where: { userId } }),
    prisma.budgetContribution.count({ where: { userId } }),
    prisma.inventoryCategory.count({ where: { userId } }),
    prisma.inventoryItem.count({ where: { userId } }),
  ]);

  const labels = [
    "Cuentas",
    "Trabajos",
    "Categorías",
    "Ingresos",
    "Gastos",
    "Transferencias",
    "Presupuestos",
    "Contribuciones",
    "Categorías Inventario",
    "Items Inventario",
  ];

  labels.forEach((label, i) => {
    console.log(`  ${label}: ${counts[i]}`);
  });
}

async function checkLegacyData(): Promise<boolean> {
  console.log("\n📋 Datos legacy (userId = null):\n");

  const counts = await Promise.all([
    prisma.account.count({ where: { userId: null } }),
    prisma.job.count({ where: { userId: null } }),
    prisma.category.count({ where: { userId: null } }),
    prisma.income.count({ where: { userId: null } }),
    prisma.expense.count({ where: { userId: null } }),
    prisma.transfer.count({ where: { userId: null } }),
    prisma.budget.count({ where: { userId: null } }),
    prisma.budgetContribution.count({ where: { userId: null } }),
    prisma.inventoryCategory.count({ where: { userId: null } }),
    prisma.inventoryItem.count({ where: { userId: null } }),
  ]);

  const labels = [
    "Cuentas",
    "Trabajos",
    "Categorías",
    "Ingresos",
    "Gastos",
    "Transferencias",
    "Presupuestos",
    "Contribuciones",
    "Categorías Inventario",
    "Items Inventario",
  ];

  let hasLegacy = false;
  let total = 0;

  labels.forEach((label, i) => {
    if (counts[i] > 0) {
      console.log(`  ${label}: ${counts[i]}`);
      hasLegacy = true;
      total += counts[i];
    }
  });

  if (!hasLegacy) {
    console.log("  No hay datos legacy para migrar.\n");
  } else {
    console.log(`\n  Total: ${total} registros\n`);
  }

  return hasLegacy;
}

async function listUsers(): Promise<void> {
  console.log("\n👥 Usuarios registrados:\n");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (users.length === 0) {
    console.log("  No hay usuarios registrados.\n");
    return;
  }

  users.forEach((user) => {
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Nombre: ${user.name || "(sin nombre)"}`);
    console.log(`  Creado: ${user.createdAt.toISOString()}`);
    console.log("");
  });
}

function showHelp(): void {
  console.log(`
📦 Script de Migración de Datos Legacy
======================================

Este script migra datos existentes (userId = null) a un usuario específico.

Comandos:

  check
    Muestra cuántos datos legacy existen pendientes de migrar.
    Ejemplo: npx tsx prisma/scripts/migrate-legacy-data.ts check

  users
    Lista todos los usuarios registrados con sus IDs.
    Ejemplo: npx tsx prisma/scripts/migrate-legacy-data.ts users

  migrate <userId>
    Migra todos los datos legacy al usuario especificado.
    Ejemplo: npx tsx prisma/scripts/migrate-legacy-data.ts migrate "abc-123-uuid"

Notas:
  - Para producción, prefija con DATABASE_URL="tu-url-produccion"
  - Siempre ejecuta "check" antes de "migrate" para verificar
  - El script es idempotente: ejecutarlo múltiples veces es seguro
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];
  const userId = args[1];

  try {
    switch (command) {
      case "check":
        await checkLegacyData();
        break;

      case "users":
        await listUsers();
        break;

      case "migrate":
        if (!userId) {
          console.error("\n❌ Error: Debes especificar el userId\n");
          console.log(
            "Uso: npx tsx prisma/scripts/migrate-legacy-data.ts migrate <userId>\n"
          );
          console.log("Ejecuta 'users' para ver los IDs disponibles.\n");
          process.exit(1);
        }
        const hasLegacy = await checkLegacyData();
        if (hasLegacy) {
          await migrateLegacyData(userId);
        }
        break;

      default:
        showHelp();
        break;
    }
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
