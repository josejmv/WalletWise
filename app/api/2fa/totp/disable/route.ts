import { NextResponse } from "next/server";
import { verify } from "otplib";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const disableSchema = z.object({
  token: z.string().length(6, "El codigo debe tener 6 digitos"),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const validated = disableSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token } = validated.data;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.totpSecret || !user.totpEnabled) {
      return NextResponse.json(
        { error: "2FA no esta habilitado" },
        { status: 400 }
      );
    }

    // Verify token before disabling (otplib v13 API)
    const result = await verify({
      token,
      secret: user.totpSecret,
    });
    const isValid = result.valid;

    if (!isValid) {
      return NextResponse.json(
        { error: "Codigo invalido" },
        { status: 400 }
      );
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totpSecret: null,
        totpEnabled: false,
      },
    });

    return NextResponse.json({
      disabled: true,
      message: "2FA deshabilitado exitosamente",
    });
  } catch (error) {
    console.error("TOTP disable error:", error);
    return NextResponse.json(
      { error: "Error al deshabilitar 2FA" },
      { status: 500 }
    );
  }
}
