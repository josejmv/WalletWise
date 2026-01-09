import { NextResponse } from "next/server";
import {
  getAccountTypeById,
  updateAccountType,
  deleteAccountType,
} from "../service";
import { updateAccountTypeSchema } from "../schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const accountType = await getAccountTypeById(id);
    return NextResponse.json({ success: true, data: accountType });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al obtener tipo de cuenta";
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
    const parsed = updateAccountTypeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const accountType = await updateAccountType(id, parsed.data);
    return NextResponse.json({ success: true, data: accountType });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al actualizar tipo de cuenta";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteAccountType(id);
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al eliminar tipo de cuenta";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
