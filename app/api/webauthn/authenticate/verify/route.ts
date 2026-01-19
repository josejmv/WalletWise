import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";

import { prisma } from "@/lib/prisma";

const rpID = process.env.WEBAUTHN_RP_ID || "localhost";
const origin = process.env.WEBAUTHN_ORIGIN || "http://localhost:3000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { response, challenge, userId } = body;

    if (!response || !challenge || !userId) {
      return NextResponse.json(
        { error: "Datos de autenticacion incompletos" },
        { status: 400 }
      );
    }

    const authenticator = await prisma.authenticator.findUnique({
      where: {
        credentialID: response.id,
      },
      include: { user: true },
    });

    if (!authenticator || authenticator.userId !== userId) {
      return NextResponse.json(
        { error: "Authenticator no encontrado" },
        { status: 400 }
      );
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: authenticator.credentialID, // Already stored as base64url string
        publicKey: Buffer.from(authenticator.credentialPublicKey, "base64url"),
        counter: Number(authenticator.counter),
        transports: authenticator.transports?.split(
          ","
        ) as AuthenticatorTransport[],
      },
    });

    if (!verification.verified) {
      return NextResponse.json(
        { error: "Verificacion fallida" },
        { status: 400 }
      );
    }

    // Update counter
    await prisma.authenticator.update({
      where: { id: authenticator.id },
      data: { counter: verification.authenticationInfo.newCounter },
    });

    return NextResponse.json({
      verified: true,
      user: {
        id: authenticator.user.id,
        email: authenticator.user.email,
        name: authenticator.user.name,
      },
    });
  } catch (error) {
    console.error("WebAuthn authentication verification error:", error);
    return NextResponse.json(
      { error: "Error al verificar autenticacion" },
      { status: 500 }
    );
  }
}
