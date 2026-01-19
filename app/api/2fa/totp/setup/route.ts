import { NextResponse } from "next/server";
import { generateSecret, generateURI } from "otplib";
import QRCode from "qrcode";

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
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (user.totpEnabled) {
      return NextResponse.json(
        { error: "2FA ya esta habilitado" },
        { status: 400 }
      );
    }

    // Generate secret (otplib v13 API)
    const secret = generateSecret();

    // Generate OTP Auth URL (otplib v13 API)
    const otpauth = generateURI({
      issuer: "WalletWise",
      label: user.email,
      secret,
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(otpauth);

    // Store secret temporarily (not enabled yet until verified)
    await prisma.user.update({
      where: { id: user.id },
      data: { totpSecret: secret },
    });

    return NextResponse.json({
      secret,
      qrCode,
      otpauth,
    });
  } catch (error) {
    console.error("TOTP setup error:", error);
    return NextResponse.json(
      { error: "Error al configurar 2FA" },
      { status: 500 }
    );
  }
}
