import { NextResponse } from "next/server";
import {
  getInventoryCategoryById,
  updateInventoryCategory,
  deleteInventoryCategory,
} from "../service";
import { updateInventoryCategorySchema } from "../schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const category = await getInventoryCategoryById(id);
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al obtener categoria de inventario";
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
    const parsed = updateInventoryCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const category = await updateInventoryCategory(id, parsed.data);
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al actualizar categoria de inventario";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteInventoryCategory(id);
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al eliminar categoria de inventario";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
