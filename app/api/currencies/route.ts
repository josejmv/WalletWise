import { NextResponse } from "next/server";
import { getCurrencies, createCurrency } from "./service";
import { createCurrencySchema } from "./schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isBase = searchParams.get("isBase");

    const filters = isBase !== null ? { isBase: isBase === "true" } : undefined;
    const currencies = await getCurrencies(filters);

    return NextResponse.json({ success: true, data: currencies });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error al obtener monedas" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createCurrencySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const currency = await createCurrency(parsed.data);
    return NextResponse.json(
      { success: true, data: currency },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear moneda";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
