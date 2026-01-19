import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - List all authenticators for the current user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const authenticators = await prisma.authenticator.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        credentialID: true,
        credentialDeviceType: true,
        credentialBackedUp: true,
        transports: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Format for display
    const formatted = authenticators.map((auth, index) => ({
      id: auth.id,
      name: `Passkey ${index + 1}`,
      deviceType: auth.credentialDeviceType === "singleDevice"
        ? "Dispositivo unico"
        : "Multi-dispositivo",
      transports: auth.transports?.split(",") || [],
      backedUp: auth.credentialBackedUp,
      createdAt: auth.createdAt,
    }));

    return NextResponse.json({ authenticators: formatted });
  } catch (error) {
    console.error("Error fetching authenticators:", error);
    return NextResponse.json(
      { error: "Error al obtener dispositivos" },
      { status: 500 }
    );
  }
}
