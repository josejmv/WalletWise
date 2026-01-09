import { NextResponse } from "next/server";
import { getTransfers, createTransfer, getTransferSummary } from "./service";
import { createTransferSchema } from "./schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromAccountId = searchParams.get("fromAccountId");
    const toAccountId = searchParams.get("toAccountId");
    const currencyId = searchParams.get("currencyId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const summary = searchParams.get("summary");

    const filters = {
      ...(fromAccountId && { fromAccountId }),
      ...(toAccountId && { toAccountId }),
      ...(currencyId && { currencyId }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
    };

    if (summary === "true") {
      const result = await getTransferSummary(
        Object.keys(filters).length > 0 ? filters : undefined,
      );
      return NextResponse.json({ success: true, data: result });
    }

    const transfers = await getTransfers(
      Object.keys(filters).length > 0 ? filters : undefined,
    );

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
    const body = await request.json();
    const parsed = createTransferSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const transfer = await createTransfer(parsed.data);
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
