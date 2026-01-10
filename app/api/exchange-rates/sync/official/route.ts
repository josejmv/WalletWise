import { NextResponse } from "next/server";
import { syncFromAPI } from "../../service";

export async function POST() {
  try {
    const result = await syncFromAPI();

    if (result.errors.length > 0 && result.synced === 0) {
      return NextResponse.json(
        { success: false, error: result.errors.join("; "), data: result },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al sincronizar";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
