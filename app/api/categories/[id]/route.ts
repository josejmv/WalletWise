import { NextResponse } from "next/server";
import { getCategoryById, updateCategory, deleteCategory } from "../service";
import { updateCategorySchema } from "../schema";
import { getUserIdForApi } from "@/lib/auth-helpers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Multi-user: get userId from auth
    const userId = await getUserIdForApi();
    const { id } = await params;
    const category = await getCategoryById(id, userId);
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener categoria";
    return NextResponse.json(
      { success: false, error: message },
      { status: 404 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    // Multi-user: get userId from auth
    const userId = await getUserIdForApi();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const category = await updateCategory(id, parsed.data, userId);
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al actualizar categoria";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    // Multi-user: get userId from auth
    const userId = await getUserIdForApi();
    const { id } = await params;
    await deleteCategory(id, userId);
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al eliminar categoria";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
