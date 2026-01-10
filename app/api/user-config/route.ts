import { NextResponse } from "next/server";
import { getUserConfig, updateUserConfig } from "./service";
import { updateUserConfigSchema } from "./schema";

export async function GET() {
  try {
    const config = await getUserConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener configuración";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const parsed = updateUserConfigSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const config = await updateUserConfig(parsed.data);
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al actualizar configuración";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
