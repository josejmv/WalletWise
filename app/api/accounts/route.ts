import { NextResponse } from "next/server";
import { getAccounts, createAccount, getTotalBalance } from "./service";
import { createAccountSchema } from "./schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountTypeId = searchParams.get("accountTypeId");
    const currencyId = searchParams.get("currencyId");
    const isActive = searchParams.get("isActive");
    const totalOnly = searchParams.get("totalOnly");

    if (totalOnly === "true") {
      const total = await getTotalBalance(currencyId ?? undefined);
      return NextResponse.json({ success: true, data: { total } });
    }

    const filters = {
      ...(accountTypeId && { accountTypeId }),
      ...(currencyId && { currencyId }),
      ...(isActive !== null && { isActive: isActive === "true" }),
    };

    const accounts = await getAccounts(
      Object.keys(filters).length > 0 ? filters : undefined,
    );

    return NextResponse.json({ success: true, data: accounts });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error al obtener cuentas" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createAccountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const account = await createAccount(parsed.data);
    return NextResponse.json({ success: true, data: account }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear cuenta";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
