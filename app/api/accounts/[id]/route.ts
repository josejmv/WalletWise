import { NextResponse } from "next/server";
import {
  getAccountById,
  updateAccount,
  deleteAccount,
  adjustBalance,
} from "../service";
import { updateAccountSchema } from "../schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const account = await getAccountById(id);
    return NextResponse.json({ success: true, data: account });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener cuenta";
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
    const parsed = updateAccountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const account = await updateAccount(id, parsed.data);
    return NextResponse.json({ success: true, data: account });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al actualizar cuenta";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteAccount(id);
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al eliminar cuenta";
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

    if (body.adjustBalance !== undefined) {
      const account = await adjustBalance(id, body.adjustBalance);
      return NextResponse.json({ success: true, data: account });
    }

    return NextResponse.json(
      { success: false, error: "Accion no reconocida" },
      { status: 400 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al ajustar balance";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
