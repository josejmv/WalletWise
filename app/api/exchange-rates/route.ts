import { NextResponse } from "next/server";
import {
  getExchangeRates,
  getLatestRates,
  createExchangeRate,
  convert,
  getHistory,
} from "./service";
import { createExchangeRateSchema, convertSchema } from "./schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromCurrencyId = searchParams.get("fromCurrencyId");
    const toCurrencyId = searchParams.get("toCurrencyId");
    const latest = searchParams.get("latest");
    const history = searchParams.get("history");
    const amount = searchParams.get("amount");

    if (amount && fromCurrencyId && toCurrencyId) {
      const result = await convert(
        fromCurrencyId,
        toCurrencyId,
        parseFloat(amount),
      );
      return NextResponse.json({ success: true, data: result });
    }

    if (history === "true" && fromCurrencyId && toCurrencyId) {
      const limit = searchParams.get("limit");
      const rates = await getHistory(
        fromCurrencyId,
        toCurrencyId,
        limit ? parseInt(limit) : undefined,
      );
      return NextResponse.json({ success: true, data: rates });
    }

    if (latest === "true") {
      const rates = await getLatestRates();
      return NextResponse.json({ success: true, data: rates });
    }

    const filters = {
      ...(fromCurrencyId && { fromCurrencyId }),
      ...(toCurrencyId && { toCurrencyId }),
    };

    const rates = await getExchangeRates(
      Object.keys(filters).length > 0 ? filters : undefined,
    );

    return NextResponse.json({ success: true, data: rates });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al obtener tasas de cambio";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.convert) {
      const parsed = convertSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: parsed.error.issues[0].message },
          { status: 400 },
        );
      }
      const result = await convert(
        parsed.data.fromCurrencyId,
        parsed.data.toCurrencyId,
        parsed.data.amount,
      );
      return NextResponse.json({ success: true, data: result });
    }

    const parsed = createExchangeRateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const rate = await createExchangeRate(parsed.data);
    return NextResponse.json({ success: true, data: rate }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear tasa de cambio";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
