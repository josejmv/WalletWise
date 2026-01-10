import { NextResponse } from "next/server";
import {
  getIncomes,
  getIncomesPaginated,
  createIncome,
  getIncomeSummary,
} from "./service";
import { createIncomeSchema } from "./schema";
import { parsePaginationParams } from "@/lib/pagination";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const accountId = searchParams.get("accountId");
    const currencyId = searchParams.get("currencyId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const summary = searchParams.get("summary");
    const paginated = searchParams.get("paginated");

    const filters = {
      ...(jobId && { jobId }),
      ...(accountId && { accountId }),
      ...(currencyId && { currencyId }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
    };

    if (summary === "true") {
      const result = await getIncomeSummary(
        Object.keys(filters).length > 0 ? filters : undefined,
      );
      return NextResponse.json({ success: true, data: result });
    }

    // Use pagination if requested
    if (paginated === "true") {
      const pagination = parsePaginationParams(searchParams);
      const result = await getIncomesPaginated(
        Object.keys(filters).length > 0 ? filters : undefined,
        pagination,
      );
      return NextResponse.json({ success: true, ...result });
    }

    const incomes = await getIncomes(
      Object.keys(filters).length > 0 ? filters : undefined,
    );

    return NextResponse.json({ success: true, data: incomes });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener ingresos";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createIncomeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const income = await createIncome(parsed.data);
    return NextResponse.json({ success: true, data: income }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear ingreso";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
