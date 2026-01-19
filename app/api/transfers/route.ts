import { NextResponse } from "next/server";
import {
  getTransfers,
  getTransfersPaginated,
  createTransfer,
  getTransferSummary,
} from "./service";
import { createTransferSchema } from "./schema";
import { parsePaginationParams } from "@/lib/pagination";
import { getUserIdForApi } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  try {
    // Multi-user: get userId from auth
    const userId = await getUserIdForApi();

    const { searchParams } = new URL(request.url);
    const fromAccountId = searchParams.get("fromAccountId");
    const toAccountId = searchParams.get("toAccountId");
    const currencyId = searchParams.get("currencyId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const summary = searchParams.get("summary");
    const paginated = searchParams.get("paginated");

    const filters = {
      userId, // Multi-user: filter by userId
      ...(fromAccountId && { fromAccountId }),
      ...(toAccountId && { toAccountId }),
      ...(currencyId && { currencyId }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
    };

    if (summary === "true") {
      const result = await getTransferSummary(filters);
      return NextResponse.json({ success: true, data: result });
    }

    // Use pagination if requested
    if (paginated === "true") {
      const pagination = parsePaginationParams(searchParams);
      const result = await getTransfersPaginated(filters, pagination);
      return NextResponse.json({ success: true, ...result });
    }

    const transfers = await getTransfers(filters);

    return NextResponse.json({ success: true, data: transfers });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al obtener transferencias";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    // Multi-user: get userId from auth
    const userId = await getUserIdForApi();

    const body = await request.json();
    const parsed = createTransferSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    // Multi-user: add userId to create data
    const transfer = await createTransfer({
      ...parsed.data,
      userId,
    });
    return NextResponse.json(
      { success: true, data: transfer },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear transferencia";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
