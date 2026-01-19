import { NextResponse } from "next/server";
import { checkSyncCooldown } from "../../service";
import { getUserIdForApi } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const userId = await getUserIdForApi();
    const status = await checkSyncCooldown(userId);
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
