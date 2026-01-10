import { NextResponse } from "next/server";
import { checkSyncCooldown } from "../../service";

export async function GET() {
  try {
    const status = await checkSyncCooldown();
    return NextResponse.json({ success: true, data: status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al verificar cooldown";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
