import { NextResponse } from "next/server";
import {
  getInventoryItemById,
  updateInventoryItem,
  deleteInventoryItem,
  adjustStock,
} from "../service";
import { updateInventoryItemSchema, stockAdjustmentSchema } from "../schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const item = await getInventoryItemById(id);
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al obtener producto de inventario";
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
    const parsed = updateInventoryItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const item = await updateInventoryItem(id, parsed.data);
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al actualizar producto de inventario";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteInventoryItem(id);
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al eliminar producto de inventario";
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

    if (body.stock) {
      const parsed = stockAdjustmentSchema.safeParse(body.stock);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: parsed.error.issues[0].message },
          { status: 400 },
        );
      }
      const item = await adjustStock(id, parsed.data);
      return NextResponse.json({ success: true, data: item });
    }

    return NextResponse.json(
      { success: false, error: "Accion no reconocida" },
      { status: 400 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al ajustar stock";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
