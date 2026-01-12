import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// v1.4.0: Schema for bulk consumption
const consumeSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      quantity: z.number().positive("La cantidad debe ser mayor a 0"),
    }),
  ),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = consumeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { items } = parsed.data;

    if (items.length === 0) {
      return NextResponse.json(
        { success: false, error: "No se seleccionaron productos" },
        { status: 400 },
      );
    }

    // Validate all items exist and have sufficient stock
    const itemIds = items.map((i) => i.id);
    const existingItems = await prisma.inventoryItem.findMany({
      where: { id: { in: itemIds } },
    });

    if (existingItems.length !== items.length) {
      return NextResponse.json(
        { success: false, error: "Algunos productos no existen" },
        { status: 400 },
      );
    }

    // Check stock for each item
    for (const item of items) {
      const existing = existingItems.find((e) => e.id === item.id);
      if (!existing) continue;

      if (Number(existing.currentQuantity) < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Stock insuficiente para "${existing.name}". Disponible: ${existing.currentQuantity}`,
          },
          { status: 400 },
        );
      }
    }

    // Process all consumptions in a transaction
    const updatedItems = await prisma.$transaction(
      items.map((item) =>
        prisma.inventoryItem.update({
          where: { id: item.id },
          data: {
            currentQuantity: {
              decrement: item.quantity,
            },
          },
          include: {
            category: true,
            currency: true,
          },
        }),
      ),
    );

    return NextResponse.json({
      success: true,
      data: updatedItems,
      message: `${items.length} producto(s) consumido(s)`,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al registrar consumo";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
