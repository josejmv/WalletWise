import { NextResponse } from "next/server";
import { getPriceHistoryById, deletePriceHistory } from "../service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const entry = await getPriceHistoryById(id);
    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al obtener registro de precio";
    return NextResponse.json(
      { success: false, error: message },
      { status: 404 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deletePriceHistory(id);
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al eliminar registro de precio";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
