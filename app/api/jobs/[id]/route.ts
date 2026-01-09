import { NextResponse } from "next/server";
import {
  getJobById,
  updateJob,
  deleteJob,
  archiveJob,
  activateJob,
} from "../service";
import { updateJobSchema } from "../schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const job = await getJobById(id);
    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener trabajo";
    return NextResponse.json(
      { success: false, error: message },
      { status: 404 },
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateJobSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const job = await updateJob(id, parsed.data);
    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al actualizar trabajo";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteJob(id);
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al eliminar trabajo";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === "archive") {
      const job = await archiveJob(id);
      return NextResponse.json({ success: true, data: job });
    }

    if (body.action === "activate") {
      const job = await activateJob(id);
      return NextResponse.json({ success: true, data: job });
    }

    return NextResponse.json(
      { success: false, error: "Accion no reconocida" },
      { status: 400 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al actualizar trabajo";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
