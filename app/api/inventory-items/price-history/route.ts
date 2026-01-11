import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");
    const limit = parseInt(searchParams.get("limit") ?? "100");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: Record<string, unknown> = {};

    if (itemId) {
      where.itemId = itemId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        (where.date as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.date as Record<string, Date>).lte = new Date(endDate);
      }
    }

    const priceHistory = await prisma.inventoryPriceHistory.findMany({
      where,
      include: {
        item: {
          select: {
            id: true,
            name: true,
            currency: {
              select: {
                code: true,
              },
            },
          },
        },
        currency: {
          select: {
            id: true,
            code: true,
            symbol: true,
          },
        },
      },
      orderBy: { date: "desc" },
      take: limit,
    });

    const result = priceHistory.map((entry) => ({
      id: entry.id,
      price: Number(entry.price),
      date: entry.date,
      source: entry.source,
      item: {
        id: entry.item.id,
        name: entry.item.name,
        currency: entry.item.currency,
      },
      currency: entry.currency,
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching price history:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener historial de precios" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { itemId, price, currencyId, source } = body;

    if (!itemId || price === undefined || !currencyId) {
      return NextResponse.json(
        {
          success: false,
          error: "itemId, price y currencyId son requeridos",
        },
        { status: 400 },
      );
    }

    const priceEntry = await prisma.inventoryPriceHistory.create({
      data: {
        itemId,
        price,
        currencyId,
        source: source ?? null,
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
          },
        },
        currency: {
          select: {
            id: true,
            code: true,
            symbol: true,
          },
        },
      },
    });

    // Update the item's estimated price
    await prisma.inventoryItem.update({
      where: { id: itemId },
      data: { estimatedPrice: price },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: priceEntry.id,
        itemId: priceEntry.itemId,
        itemName: priceEntry.item.name,
        price: Number(priceEntry.price),
        currency: priceEntry.currency,
        date: priceEntry.date,
        source: priceEntry.source,
      },
    });
  } catch (error) {
    console.error("Error creating price history entry:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear entrada de historial" },
      { status: 500 },
    );
  }
}
