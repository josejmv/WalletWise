import { NextResponse } from "next/server";
import { getPriceHistoryById, deletePriceHistory } from "../service";
import { getUserIdForApi } from "@/lib/auth-helpers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Multi-user: get userId from auth
    const userId = await getUserIdForApi();
    const { id } = await params;
    const entry = await getPriceHistoryById(id, userId);
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
    // Multi-user: get userId from auth
    const userId = await getUserIdForApi();
    const { id } = await params;
    await deletePriceHistory(id, userId);
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
