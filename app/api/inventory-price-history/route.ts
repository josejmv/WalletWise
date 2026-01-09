import { NextResponse } from "next/server";
import {
  getPriceHistory,
  getPriceHistoryByItem,
  createPriceHistory,
  createManyPriceHistory,
  getLatestPrice,
  getPriceStats,
} from "./service";
import {
  createPriceHistorySchema,
  batchCreatePriceHistorySchema,
} from "./schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");
    const currencyId = searchParams.get("currencyId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const latest = searchParams.get("latest");
    const stats = searchParams.get("stats");
    const limit = searchParams.get("limit");

    if (stats === "true" && itemId) {
      const result = await getPriceStats(itemId);
      return NextResponse.json({ success: true, data: result });
    }

    if (latest === "true" && itemId) {
      const result = await getLatestPrice(itemId);
      return NextResponse.json({ success: true, data: result });
    }

    if (itemId) {
      const history = await getPriceHistoryByItem(
        itemId,
        limit ? parseInt(limit) : undefined,
      );
      return NextResponse.json({ success: true, data: history });
    }

    const filters = {
      ...(currencyId && { currencyId }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
    };

    const history = await getPriceHistory(
      Object.keys(filters).length > 0 ? filters : undefined,
    );

    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al obtener historial de precios";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.entries) {
      const parsed = batchCreatePriceHistorySchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: parsed.error.issues[0].message },
          { status: 400 },
        );
      }
      const entries = await createManyPriceHistory(parsed.data.entries);
      return NextResponse.json(
        { success: true, data: entries },
        { status: 201 },
      );
    }

    const parsed = createPriceHistorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const entry = await createPriceHistory(parsed.data);
    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al crear registro de precio";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
