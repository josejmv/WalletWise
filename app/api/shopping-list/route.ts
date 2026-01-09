import { NextResponse } from "next/server";
import {
  generateShoppingList,
  getLowStockItems,
  getShoppingListByCategory,
  getShoppingListSummary,
  markItemPurchased,
} from "./service";
import { generateShoppingListSchema } from "./schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view");
    const categoryIds = searchParams.get("categoryIds");
    const priorityThreshold = searchParams.get("priorityThreshold");
    const includeAll = searchParams.get("includeAll");

    switch (view) {
      case "low-stock":
        const lowStock = await getLowStockItems();
        return NextResponse.json({ success: true, data: lowStock });

      case "by-category":
        const byCategory = await getShoppingListByCategory();
        return NextResponse.json({ success: true, data: byCategory });

      case "summary":
        const summary = await getShoppingListSummary();
        return NextResponse.json({ success: true, data: summary });

      default:
        const input = {
          ...(categoryIds && { categoryIds: categoryIds.split(",") }),
          ...(priorityThreshold && {
            priorityThreshold: priorityThreshold as "high" | "medium" | "low",
          }),
          ...(includeAll && { includeAll: includeAll === "true" }),
        };

        const list = await generateShoppingList(
          Object.keys(input).length > 0 ? input : undefined,
        );
        return NextResponse.json({ success: true, data: list });
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al generar lista de compras";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if it's a mark-purchased action
    if (body.action === "mark-purchased") {
      if (!body.itemId || !body.quantity) {
        return NextResponse.json(
          { success: false, error: "itemId y quantity son requeridos" },
          { status: 400 },
        );
      }

      await markItemPurchased(body.itemId, body.quantity);
      return NextResponse.json({
        success: true,
        data: { message: "Producto marcado como comprado" },
      });
    }

    // Generate new shopping list
    const parsed = generateShoppingListSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const list = await generateShoppingList(parsed.data);
    return NextResponse.json({ success: true, data: list }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al procesar lista de compras";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
