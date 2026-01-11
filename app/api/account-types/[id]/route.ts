import { NextResponse } from "next/server";
import {
  getAccountTypeById,
  updateAccountType,
  deleteAccountType,
  getAccountCount,
  moveAccountsAndDeleteType,
} from "../service";
import { updateAccountTypeSchema } from "../schema";
import { z } from "zod";

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

    // v1.3.0: Check if request has a body with moveToTypeId
    let moveToTypeId: string | undefined;
    try {
      const body = await request.json();
      const moveSchema = z.object({
        moveToTypeId: z.string().uuid().optional(),
      });
      const parsed = moveSchema.safeParse(body);
      if (parsed.success && parsed.data.moveToTypeId) {
        moveToTypeId = parsed.data.moveToTypeId;
      }
    } catch {
      // No body or invalid JSON - proceed with regular delete
    }

    // If moveToTypeId provided, move accounts first then delete
    if (moveToTypeId) {
      await moveAccountsAndDeleteType(id, moveToTypeId);
    } else {
      await deleteAccountType(id);
    }

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

// v1.3.0: Get account count for this type
export async function OPTIONS(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const count = await getAccountCount(id);
    return NextResponse.json({ success: true, data: { count } });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al obtener conteo de cuentas";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
