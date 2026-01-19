import { NextResponse } from "next/server";
import { getCategories, createCategory, getCategoryTree } from "./service";
import { createCategorySchema } from "./schema";
import { getUserIdForApi } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  try {
    // Multi-user: get userId from auth
    const userId = await getUserIdForApi();

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");
    const rootOnly = searchParams.get("rootOnly");
    const tree = searchParams.get("tree");

    if (tree === "true") {
      const categories = await getCategoryTree(userId);
      return NextResponse.json({ success: true, data: categories });
    }

    const filters = {
      userId, // Multi-user: filter by userId
      ...(parentId && { parentId }),
      ...(rootOnly === "true" && { rootOnly: true }),
    };

    const categories = await getCategories(filters);

    return NextResponse.json({ success: true, data: categories });
  } catch {
    return NextResponse.json(
      { success: false, error: "Error al obtener categorias" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    // Multi-user: get userId from auth
    const userId = await getUserIdForApi();

    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    // Multi-user: add userId to create data
    const category = await createCategory({
      ...parsed.data,
      userId,
    });
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
