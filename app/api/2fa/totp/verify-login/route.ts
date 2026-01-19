import { NextResponse } from "next/server";
import { verify } from "otplib";
import { z } from "zod";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

const verifySchema = z.object({
  token: z.string().length(6, "El codigo debe tener 6 digitos"),
  userId: z.string().min(1, "userId requerido"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = verifySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, userId } = validated.data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.totpSecret || !user.totpEnabled) {
      return NextResponse.json(
        { error: "2FA no configurado para este usuario" },
        { status: 400 }
      );
    }

    // Verify token (otplib v13 API)
    const result = await verify({
      token,
      secret: user.totpSecret,
    });
    const isValid = result.valid;

    if (!isValid) {
      return NextResponse.json({ error: "Codigo invalido" }, { status: 400 });
    }

    // Mark 2FA as verified for this session
    const cookieStore = await cookies();
    cookieStore.set("2fa-verified", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return NextResponse.json({
      verified: true,
      message: "2FA verificado exitosamente",
    });
  } catch (error) {
    console.error("TOTP verify-login error:", error);
    return NextResponse.json(
      { error: "Error al verificar codigo" },
      { status: 500 }
    );
  }
}
