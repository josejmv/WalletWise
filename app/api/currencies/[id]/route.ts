import { NextResponse } from "next/server";
import {
  getCurrencyById,
  updateCurrency,
  deleteCurrency,
  setBaseCurrency,
} from "../service";
import { updateCurrencySchema } from "../schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const currency = await getCurrencyById(id);
    return NextResponse.json({ success: true, data: currency });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener moneda";
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
    const parsed = updateCurrencySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const currency = await updateCurrency(id, parsed.data);
    return NextResponse.json({ success: true, data: currency });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al actualizar moneda";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteCurrency(id);
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al eliminar moneda";
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

    if (body.setAsBase) {
      const currency = await setBaseCurrency(id);
      return NextResponse.json({ success: true, data: currency });
    }

    return NextResponse.json(
      { success: false, error: "Accion no reconocida" },
      { status: 400 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al actualizar moneda";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
