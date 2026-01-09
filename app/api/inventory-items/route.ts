import { NextResponse } from "next/server";
import {
  getInventoryItems,
  createInventoryItem,
  getLowStockItems,
  getShoppingList,
} from "./service";
import { createInventoryItemSchema } from "./schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const currencyId = searchParams.get("currencyId");
    const isActive = searchParams.get("isActive");
    const lowStock = searchParams.get("lowStock");
    const shoppingList = searchParams.get("shoppingList");

    if (shoppingList === "true") {
      const list = await getShoppingList();
      return NextResponse.json({ success: true, data: list });
    }

    if (lowStock === "true") {
      const items = await getLowStockItems();
      return NextResponse.json({ success: true, data: items });
    }

    const filters = {
      ...(categoryId && { categoryId }),
      ...(currencyId && { currencyId }),
      ...(isActive !== null && { isActive: isActive === "true" }),
    };

    const items = await getInventoryItems(
      Object.keys(filters).length > 0 ? filters : undefined,
    );

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error al obtener productos de inventario" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createInventoryItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const item = await createInventoryItem(parsed.data);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al crear producto de inventario";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
