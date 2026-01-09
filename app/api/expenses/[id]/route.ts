import { NextResponse } from "next/server";
import {
  getExpenseById,
  updateExpense,
  deleteExpense,
  processRecurringExpense,
} from "../service";
import { updateExpenseSchema } from "../schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const expense = await getExpenseById(id);
    return NextResponse.json({ success: true, data: expense });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener gasto";
    return NextResponse.json(
      { success: false, error: message },
      { status: 404 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateExpenseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const expense = await updateExpense(id, parsed.data);
    return NextResponse.json({ success: true, data: expense });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al actualizar gasto";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteExpense(id);
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al eliminar gasto";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "process-recurring") {
      const expense = await processRecurringExpense(id);
      return NextResponse.json(
        { success: true, data: expense },
        { status: 201 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Acción no válida" },
      { status: 400 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al procesar acción";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
