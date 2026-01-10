import { NextResponse } from "next/server";
import { syncFromBinance } from "../../service";

export async function POST() {
  try {
    const result = await syncFromBinance();

    if (result.errors.length > 0 && result.synced === 0) {
      return NextResponse.json({ success: false, ...result }, { status: 400 });
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al sincronizar Binance";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
