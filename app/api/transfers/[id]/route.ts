import { NextResponse } from "next/server";
import { getTransferById, updateTransfer, deleteTransfer } from "../service";
import { updateTransferSchema } from "../schema";
import { getUserIdForApi } from "@/lib/auth-helpers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Multi-user: get userId from auth
    const userId = await getUserIdForApi();
    const { id } = await params;
    const transfer = await getTransferById(id, userId);
    return NextResponse.json({ success: true, data: transfer });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener transferencia";
    return NextResponse.json(
      { success: false, error: message },
      { status: 404 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    // Multi-user: get userId from auth
    const userId = await getUserIdForApi();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateTransferSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const transfer = await updateTransfer(id, parsed.data, userId);
    return NextResponse.json({ success: true, data: transfer });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al actualizar transferencia";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    // Multi-user: get userId from auth
    const userId = await getUserIdForApi();
    const { id } = await params;
    await deleteTransfer(id, userId);
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al eliminar transferencia";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
