import { NextResponse } from "next/server";
import {
  exportAllData,
  importAllData,
  convertToCSV,
  type BackupData,
} from "./service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";

    const backup = await exportAllData();

    if (format === "csv") {
      const csv = convertToCSV(backup);
      const filename = `walletwise-backup-${new Date().toISOString().split("T")[0]}.csv`;

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // Default: JSON format
    const filename = `walletwise-backup-${new Date().toISOString().split("T")[0]}.json`;

    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al exportar datos";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate backup structure
    if (!body.version || !body.data) {
      return NextResponse.json(
        {
          success: false,
          error: "Formato de backup invalido. Se requiere version y data.",
        },
        { status: 400 },
      );
    }

    const backup = body as BackupData;
    const result = await importAllData(backup);

    if (result.errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: result.errors.join("; "),
          imported: result.imported,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Datos importados correctamente",
      imported: result.imported,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al importar datos";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
