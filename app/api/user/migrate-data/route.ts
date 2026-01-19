import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Migrates all legacy data (userId = null) to the authenticated user.
 * This is used when the first user registers to claim existing data.
 * Should only be run once per installation.
 */
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if there's any data to migrate (userId = null)
    const legacyAccountsCount = await prisma.account.count({
      where: { userId: null },
    });

    if (legacyAccountsCount === 0) {
      return NextResponse.json({
        message: "No hay datos para migrar",
        migrated: false,
      });
    }

    // Run migration in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Migrate accounts
      const accounts = await tx.account.updateMany({
        where: { userId: null },
        data: { userId },
      });

      // Migrate jobs
      const jobs = await tx.job.updateMany({
        where: { userId: null },
        data: { userId },
      });

      // Migrate categories
      const categories = await tx.category.updateMany({
        where: { userId: null },
        data: { userId },
      });

      // Migrate incomes
      const incomes = await tx.income.updateMany({
        where: { userId: null },
        data: { userId },
      });

      // Migrate expenses
      const expenses = await tx.expense.updateMany({
        where: { userId: null },
        data: { userId },
      });

      // Migrate transfers
      const transfers = await tx.transfer.updateMany({
        where: { userId: null },
        data: { userId },
      });

      // Migrate budgets
      const budgets = await tx.budget.updateMany({
        where: { userId: null },
        data: { userId },
      });

      // Migrate budget contributions
      const contributions = await tx.budgetContribution.updateMany({
        where: { userId: null },
        data: { userId },
      });

      // Migrate inventory categories
      const inventoryCategories = await tx.inventoryCategory.updateMany({
        where: { userId: null },
        data: { userId },
      });

      // Migrate inventory items
      const inventoryItems = await tx.inventoryItem.updateMany({
        where: { userId: null },
        data: { userId },
      });

      // Link existing user config to this user
      const userConfig = await tx.userConfig.updateMany({
        where: { userId: null },
        data: { userId },
      });

      return {
        accounts: accounts.count,
        jobs: jobs.count,
        categories: categories.count,
        incomes: incomes.count,
        expenses: expenses.count,
        transfers: transfers.count,
        budgets: budgets.count,
        contributions: contributions.count,
        inventoryCategories: inventoryCategories.count,
        inventoryItems: inventoryItems.count,
        userConfig: userConfig.count,
      };
    });

    return NextResponse.json({
      message: "Datos migrados exitosamente",
      migrated: true,
      counts: result,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Error al migrar datos" },
      { status: 500 }
    );
  }
}

/**
 * Check if there's legacy data that needs migration
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Count legacy data
    const legacyCounts = await prisma.$transaction([
      prisma.account.count({ where: { userId: null } }),
      prisma.job.count({ where: { userId: null } }),
      prisma.category.count({ where: { userId: null } }),
      prisma.income.count({ where: { userId: null } }),
      prisma.expense.count({ where: { userId: null } }),
      prisma.transfer.count({ where: { userId: null } }),
      prisma.budget.count({ where: { userId: null } }),
      prisma.inventoryItem.count({ where: { userId: null } }),
    ]);

    const totalLegacy = legacyCounts.reduce((a, b) => a + b, 0);

    return NextResponse.json({
      hasLegacyData: totalLegacy > 0,
      totalRecords: totalLegacy,
      breakdown: {
        accounts: legacyCounts[0],
        jobs: legacyCounts[1],
        categories: legacyCounts[2],
        incomes: legacyCounts[3],
        expenses: legacyCounts[4],
        transfers: legacyCounts[5],
        budgets: legacyCounts[6],
        inventoryItems: legacyCounts[7],
      },
    });
  } catch (error) {
    console.error("Check legacy data error:", error);
    return NextResponse.json(
      { error: "Error al verificar datos" },
      { status: 500 }
    );
  }
}
