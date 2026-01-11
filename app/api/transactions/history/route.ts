import { NextResponse } from "next/server";
import { getTransactionHistory, type TransactionType } from "./service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters from query params
    const type = searchParams.get("type") as TransactionType | null;
    const accountId = searchParams.get("accountId");
    const categoryId = searchParams.get("categoryId");
    const currencyId = searchParams.get("currencyId");
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");

    const filters = {
      ...(type && { type }),
      ...(accountId && { accountId }),
      ...(categoryId && { categoryId }),
      ...(currencyId && { currencyId }),
      ...(startDateStr && { startDate: new Date(startDateStr) }),
      ...(endDateStr && { endDate: new Date(endDateStr) }),
      ...(page && { page: parseInt(page, 10) }),
      ...(pageSize && { pageSize: parseInt(pageSize, 10) }),
    };

    const result = await getTransactionHistory(filters);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al obtener historial de transacciones";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
