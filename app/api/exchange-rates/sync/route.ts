import { NextResponse } from "next/server";
import { syncFromAPI } from "../service";

export async function POST() {
  try {
    const result = await syncFromAPI();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al sincronizar";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
