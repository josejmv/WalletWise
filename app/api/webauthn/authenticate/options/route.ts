import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";

import { prisma } from "@/lib/prisma";

const rpID = process.env.WEBAUTHN_RP_ID || "localhost";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email requerido" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { authenticators: true },
    });

    if (!user || !user.webauthnEnabled || user.authenticators.length === 0) {
      return NextResponse.json(
        { error: "WebAuthn no habilitado para este usuario" },
        { status: 400 }
      );
    }

    const allowCredentials = user.authenticators.map((auth) => ({
      id: auth.credentialID, // Already stored as base64url string
      transports: auth.transports?.split(",") as AuthenticatorTransport[],
    }));

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials,
      userVerification: "preferred",
    });

    return NextResponse.json({
      options,
      challenge: options.challenge,
      userId: user.id,
    });
  } catch (error) {
    console.error("WebAuthn authentication options error:", error);
    return NextResponse.json(
      { error: "Error al generar opciones de autenticacion" },
      { status: 500 }
    );
  }
}
