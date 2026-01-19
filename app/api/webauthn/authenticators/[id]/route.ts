import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE - Remove a specific authenticator
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { id } = await params;

    // Verify the authenticator belongs to this user
    const authenticator = await prisma.authenticator.findUnique({
      where: { id },
    });

    if (!authenticator) {
      return NextResponse.json(
        { error: "Dispositivo no encontrado" },
        { status: 404 }
      );
    }

    if (authenticator.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    // Delete the authenticator
    await prisma.authenticator.delete({
      where: { id },
    });

    // Check if user has any remaining authenticators
    const remainingCount = await prisma.authenticator.count({
      where: { userId: session.user.id },
    });

    // If no authenticators left, disable WebAuthn for the user
    if (remainingCount === 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { webauthnEnabled: false },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Dispositivo eliminado",
      remainingCount,
    });
  } catch (error) {
    console.error("Error deleting authenticator:", error);
    return NextResponse.json(
      { error: "Error al eliminar dispositivo" },
      { status: 500 }
    );
  }
}
