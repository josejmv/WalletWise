import { NextResponse } from "next/server";
import { getUserIdForApi } from "@/lib/auth-helpers";
import { getInventoryCategories, createInventoryCategory } from "./service";
import { createInventoryCategorySchema } from "./schema";

export async function GET() {
  try {
    const userId = await getUserIdForApi();
    const categories = await getInventoryCategories(userId);
    return NextResponse.json({ success: true, data: categories });
  } catch {
    return NextResponse.json(
      { success: false, error: "Error al obtener categorias de inventario" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdForApi();
    const body = await request.json();
    const parsed = createInventoryCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const category = await createInventoryCategory(parsed.data, userId);
    return NextResponse.json(
      { success: true, data: category },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al crear categoria de inventario";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
