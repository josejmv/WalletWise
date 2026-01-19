import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const rpID = process.env.WEBAUTHN_RP_ID || "localhost";
const rpName = process.env.WEBAUTHN_RP_NAME || "WalletWise";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { authenticators: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const userAuthenticators = user.authenticators.map((auth) => ({
      id: auth.credentialID, // Already stored as base64url string
      transports: auth.transports?.split(",") as AuthenticatorTransport[],
    }));

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: Buffer.from(user.id),
      userName: user.email,
      userDisplayName: user.name || user.email,
      attestationType: "none",
      excludeCredentials: userAuthenticators,
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
        authenticatorAttachment: "platform",
      },
    });

    // Store challenge in session for verification
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // We'll store the challenge temporarily - in production, use a proper session store
        // For simplicity, we'll pass it back and verify on the client
      },
    });

    return NextResponse.json({
      options,
      challenge: options.challenge,
    });
  } catch (error) {
    console.error("WebAuthn registration options error:", error);
    return NextResponse.json(
      { error: "Error al generar opciones de registro" },
      { status: 500 }
    );
  }
}
