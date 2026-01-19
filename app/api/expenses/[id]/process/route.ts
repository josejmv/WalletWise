import { NextResponse } from "next/server";
import { processRecurringExpense } from "../../service";
import { getUserIdForApi } from "@/lib/auth-helpers";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: Params) {
  try {
    const userId = await getUserIdForApi();
    const { id } = await params;
    const expense = await processRecurringExpense(id, userId);
    return NextResponse.json({ success: true, data: expense });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al procesar gasto";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
