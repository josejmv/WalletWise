import { NextResponse } from "next/server";
import { syncFromBinance } from "../../service";
import { getUserIdForApi } from "@/lib/auth-helpers";

export async function POST() {
  try {
    const userId = await getUserIdForApi();
    const result = await syncFromBinance(userId);

    if (result.errors.length > 0 && result.synced === 0) {
      return NextResponse.json(
        { success: false, error: result.errors.join("; "), data: result },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al sincronizar Binance";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
