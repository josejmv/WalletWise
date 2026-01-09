import { NextResponse } from "next/server";
import { getCategories, createCategory, getCategoryTree } from "./service";
import { createCategorySchema } from "./schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");
    const rootOnly = searchParams.get("rootOnly");
    const tree = searchParams.get("tree");

    if (tree === "true") {
      const categories = await getCategoryTree();
      return NextResponse.json({ success: true, data: categories });
    }

    const filters = {
      ...(parentId && { parentId }),
      ...(rootOnly === "true" && { rootOnly: true }),
    };

    const categories = await getCategories(
      Object.keys(filters).length > 0 ? filters : undefined,
    );

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error al obtener categorias" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const category = await createCategory(parsed.data);
    return NextResponse.json(
      { success: true, data: category },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear categoria";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
