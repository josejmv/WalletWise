import { NextResponse } from "next/server";
import {
  getAccounts,
  createAccount,
  getTotalBalance,
  getAccountsWithBlockedBalances,
} from "./service";
import { createAccountSchema } from "./schema";
import { getUserIdForApi } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  try {
    // Multi-user: get userId from auth
    const userId = await getUserIdForApi();

    const { searchParams } = new URL(request.url);
    const accountTypeId = searchParams.get("accountTypeId");
    const currencyId = searchParams.get("currencyId");
    const isActive = searchParams.get("isActive");
    const totalOnly = searchParams.get("totalOnly");
    const withBlocked = searchParams.get("withBlocked");

    if (totalOnly === "true") {
      const total = await getTotalBalance(currencyId ?? undefined, userId);
      return NextResponse.json({ success: true, data: { total } });
    }

    // Return accounts with blocked balance info
    if (withBlocked === "true") {
      const accounts = await getAccountsWithBlockedBalances(userId);
      return NextResponse.json({ success: true, data: accounts });
    }

    const filters = {
      userId, // Multi-user: filter by userId
      ...(accountTypeId && { accountTypeId }),
      ...(currencyId && { currencyId }),
      ...(isActive !== null && { isActive: isActive === "true" }),
    };

    const accounts = await getAccounts(filters);

    return NextResponse.json({ success: true, data: accounts });
  } catch {
    return NextResponse.json(
      { success: false, error: "Error al obtener cuentas" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    // Multi-user: get userId from auth
    const userId = await getUserIdForApi();

    const body = await request.json();
    const parsed = createAccountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    // Multi-user: add userId to create data
    const account = await createAccount({
      ...parsed.data,
      userId,
    });
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
