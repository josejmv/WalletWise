import { NextResponse } from "next/server";
import {
  getIncomeById,
  updateIncome,
  deleteIncome,
  generateIncomeFromJob,
} from "../service";
import { updateIncomeSchema } from "../schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const income = await getIncomeById(id);
    return NextResponse.json({ success: true, data: income });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener ingreso";
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
    const parsed = updateIncomeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const income = await updateIncome(id, parsed.data);
    return NextResponse.json({ success: true, data: income });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al actualizar ingreso";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteIncome(id);
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al eliminar ingreso";
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

    if (action === "generate-from-job") {
      const income = await generateIncomeFromJob(id);
      return NextResponse.json(
        { success: true, data: income },
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
