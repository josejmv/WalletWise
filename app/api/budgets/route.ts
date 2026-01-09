import { NextResponse } from "next/server";
import { getBudgets, getActiveBudgets, createBudget } from "./service";
import { createBudgetSchema } from "./schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const currencyId = searchParams.get("currencyId");
    const accountId = searchParams.get("accountId");
    const activeOnly = searchParams.get("activeOnly");

    if (activeOnly === "true") {
      const budgets = await getActiveBudgets();
      return NextResponse.json({ success: true, data: budgets });
    }

    const filters = {
      ...(type && { type: type as "goal" | "envelope" }),
      ...(status && { status: status as "active" | "completed" | "cancelled" }),
      ...(currencyId && { currencyId }),
      ...(accountId && { accountId }),
    };

    const budgets = await getBudgets(
      Object.keys(filters).length > 0 ? filters : undefined,
    );

    return NextResponse.json({ success: true, data: budgets });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error al obtener presupuestos" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createBudgetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const budget = await createBudget(parsed.data);
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
