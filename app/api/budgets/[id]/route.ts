import { NextResponse } from "next/server";
import {
  getBudgetById,
  updateBudget,
  deleteBudget,
  contributeToBudget,
  withdrawFromBudget,
  cancelBudget,
  reactivateBudget,
  getContributions,
} from "../service";
import {
  updateBudgetSchema,
  contributeSchema,
  withdrawSchema,
} from "../schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const contributions = searchParams.get("contributions");

    if (contributions === "true") {
      const list = await getContributions(id);
      return NextResponse.json({ success: true, data: list });
    }

    const budget = await getBudgetById(id);
    return NextResponse.json({ success: true, data: budget });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener presupuesto";
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
    const parsed = updateBudgetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const budget = await updateBudget(id, parsed.data);
    return NextResponse.json({ success: true, data: budget });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al actualizar presupuesto";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteBudget(id);
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al eliminar presupuesto";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === "contribute") {
      const parsed = contributeSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: parsed.error.issues[0].message },
          { status: 400 },
        );
      }
      const budget = await contributeToBudget(id, parsed.data);
      return NextResponse.json({ success: true, data: budget });
    }

    if (body.action === "withdraw") {
      const parsed = withdrawSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: parsed.error.issues[0].message },
          { status: 400 },
        );
      }
      const budget = await withdrawFromBudget(id, parsed.data);
      return NextResponse.json({ success: true, data: budget });
    }

    if (body.action === "cancel") {
      const budget = await cancelBudget(id);
      return NextResponse.json({ success: true, data: budget });
    }

    if (body.action === "reactivate") {
      const budget = await reactivateBudget(id);
      return NextResponse.json({ success: true, data: budget });
    }

    return NextResponse.json(
      { success: false, error: "Accion no reconocida" },
      { status: 400 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al actualizar presupuesto";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
