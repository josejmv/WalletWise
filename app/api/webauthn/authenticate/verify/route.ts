import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { cookies } from "next/headers";
import crypto from "crypto";

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

    // Generate a short-lived verification token for the credentials provider
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 60000; // 1 minute expiry

    // Store the token with user ID and expiry
    const cookieStore = await cookies();
    cookieStore.set(
      "webauthn-verified",
      JSON.stringify({
        token: verificationToken,
        userId: authenticator.user.id,
        expiry: tokenExpiry,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60, // 1 minute
        path: "/",
      }
    );

    return NextResponse.json({
      verified: true,
      verificationToken,
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
