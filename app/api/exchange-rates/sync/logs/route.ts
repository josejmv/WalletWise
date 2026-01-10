import { NextResponse } from "next/server";
import { getSyncLogs } from "../../service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const logs = await getSyncLogs(limit);
    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener logs";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
