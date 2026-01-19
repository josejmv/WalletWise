import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const rpID = process.env.WEBAUTHN_RP_ID || "localhost";
const origin = process.env.WEBAUTHN_ORIGIN || "http://localhost:3000";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { response, challenge } = body;

    if (!response || !challenge) {
      return NextResponse.json(
        { error: "Datos de registro incompletos" },
        { status: 400 }
      );
    }

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: "Verificacion fallida" },
        { status: 400 }
      );
    }

    const { credential, credentialDeviceType, credentialBackedUp } =
      verification.registrationInfo;

    // Store the authenticator
    await prisma.authenticator.create({
      data: {
        credentialID: Buffer.from(credential.id).toString("base64url"),
        userId: session.user.id,
        credentialPublicKey: Buffer.from(credential.publicKey).toString(
          "base64url"
        ),
        counter: credential.counter,
        credentialDeviceType,
        credentialBackedUp,
        transports: response.response.transports?.join(","),
      },
    });

    // Enable WebAuthn for user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { webauthnEnabled: true },
    });

    return NextResponse.json({
      verified: true,
      message: "Passkey registrado exitosamente",
    });
  } catch (error) {
    console.error("WebAuthn registration verification error:", error);
    return NextResponse.json(
      { error: "Error al verificar registro" },
      { status: 500 }
    );
  }
}
