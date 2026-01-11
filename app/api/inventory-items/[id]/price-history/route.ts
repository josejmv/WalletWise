import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Verify item exists
    const item = await prisma.inventoryItem.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 },
      );
    }

    const where: Record<string, unknown> = { itemId: id };

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

    const result = {
      item: {
        id: item.id,
        name: item.name,
      },
      history: priceHistory.map((entry) => ({
        id: entry.id,
        price: Number(entry.price),
        currency: entry.currency,
        date: entry.date,
        source: entry.source,
      })),
    };

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching item price history:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener historial de precios" },
      { status: 500 },
    );
  }
}
