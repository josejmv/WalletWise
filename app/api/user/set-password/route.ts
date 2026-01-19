import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const setPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "La contrasena debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "La contrasena debe tener al menos una mayuscula, una minuscula y un numero"
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contrasenas no coinciden",
  path: ["confirmPassword"],
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const validated = setPasswordSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { password } = validated.data;

    // Check if user already has a password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (user?.password) {
      return NextResponse.json(
        { error: "Ya tienes una contrasena configurada. Usa cambiar contrasena." },
        { status: 400 }
      );
    }

    // Hash and save the password
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Contrasena configurada exitosamente",
    });
  } catch (error) {
    console.error("Set password error:", error);
    return NextResponse.json(
      { error: "Error al configurar contraseña" },
      { status: 500 }
    );
  }
}
