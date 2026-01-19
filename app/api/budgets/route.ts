import { NextResponse } from "next/server";
import { getBudgets, getActiveBudgets, createBudget } from "./service";
import { createBudgetSchema } from "./schema";
import { getUserIdForApi } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  try {
    // Multi-user: get userId from auth
    const userId = await getUserIdForApi();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const currencyId = searchParams.get("currencyId");
    const accountId = searchParams.get("accountId");
    const activeOnly = searchParams.get("activeOnly");

    if (activeOnly === "true") {
      const budgets = await getActiveBudgets(userId);
      return NextResponse.json({ success: true, data: budgets });
    }

    const filters = {
      userId, // Multi-user: filter by userId
      ...(type && { type: type as "goal" | "envelope" }),
      ...(status && { status: status as "active" | "completed" | "cancelled" }),
      ...(currencyId && { currencyId }),
      ...(accountId && { accountId }),
    };

    const budgets = await getBudgets(filters);

    return NextResponse.json({ success: true, data: budgets });
  } catch {
    return NextResponse.json(
      { success: false, error: "Error al obtener presupuestos" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    // Multi-user: get userId from auth
    const userId = await getUserIdForApi();

    const body = await request.json();
    const parsed = createBudgetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    // Multi-user: add userId to create data
    const budget = await createBudget({
      ...parsed.data,
      userId,
    });
    return NextResponse.json({ success: true, data: budget }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear presupuesto";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
