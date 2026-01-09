import { NextResponse } from "next/server";
import {
  getExchangeRateById,
  updateExchangeRate,
  deleteExchangeRate,
} from "../service";
import { updateExchangeRateSchema } from "../schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const rate = await getExchangeRateById(id);
    return NextResponse.json({ success: true, data: rate });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al obtener tasa de cambio";
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
    const parsed = updateExchangeRateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const rate = await updateExchangeRate(id, parsed.data);
    return NextResponse.json({ success: true, data: rate });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al actualizar tasa de cambio";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteExchangeRate(id);
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al eliminar tasa de cambio";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
