import { NextResponse } from "next/server";
import {
  getExpenses,
  getExpensesPaginated,
  createExpense,
  getExpenseSummary,
  getRecurringExpenses,
  getDueExpenses,
} from "./service";
import { createExpenseSchema } from "./schema";
import { parsePaginationParams } from "@/lib/pagination";
import { getUserIdForApi } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  try {
    const userId = await getUserIdForApi();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const accountId = searchParams.get("accountId");
    const currencyId = searchParams.get("currencyId");
    const isRecurring = searchParams.get("isRecurring");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const summary = searchParams.get("summary");
    const recurring = searchParams.get("recurring");
    const due = searchParams.get("due");
    const paginated = searchParams.get("paginated");

    if (recurring === "true") {
      const expenses = await getRecurringExpenses(userId);
      return NextResponse.json({ success: true, data: expenses });
    }

    if (due === "true") {
      const expenses = await getDueExpenses(userId);
      return NextResponse.json({ success: true, data: expenses });
    }

    const filters = {
      userId,
      ...(categoryId && { categoryId }),
      ...(accountId && { accountId }),
      ...(currencyId && { currencyId }),
      ...(isRecurring !== null && { isRecurring: isRecurring === "true" }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
    };

    if (summary === "true") {
      const result = await getExpenseSummary(filters);
      return NextResponse.json({ success: true, data: result });
    }

    // Use pagination if requested
    if (paginated === "true") {
      const pagination = parsePaginationParams(searchParams);
      const result = await getExpensesPaginated(filters, pagination);
      return NextResponse.json({ success: true, ...result });
    }

    const expenses = await getExpenses(filters);

    return NextResponse.json({ success: true, data: expenses });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener gastos";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdForApi();
    const body = await request.json();
    const parsed = createExpenseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const expense = await createExpense({ ...parsed.data, userId });
    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear gasto";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
