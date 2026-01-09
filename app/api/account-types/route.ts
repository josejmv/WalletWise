import { NextResponse } from "next/server";
import { getAccountTypes, createAccountType } from "./service";
import { createAccountTypeSchema } from "./schema";

export async function GET() {
  try {
    const accountTypes = await getAccountTypes();
    return NextResponse.json({ success: true, data: accountTypes });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error al obtener tipos de cuenta" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createAccountTypeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const accountType = await createAccountType(parsed.data);
    return NextResponse.json(
      { success: true, data: accountType },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear tipo de cuenta";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
