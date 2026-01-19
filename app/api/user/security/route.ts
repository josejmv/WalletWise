import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        totpEnabled: true,
        webauthnEnabled: true,
        _count: {
          select: { authenticators: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      totpEnabled: user.totpEnabled,
      webauthnEnabled: user.webauthnEnabled,
      authenticatorCount: user._count.authenticators,
    });
  } catch (error) {
    console.error("Error fetching security info:", error);
    return NextResponse.json(
      { error: "Error al obtener informacion de seguridad" },
      { status: 500 }
    );
  }
}
