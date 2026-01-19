import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Clear the 2FA verification cookie
    cookieStore.delete("2fa-verified");

    // Clear WebAuthn verification cookie if exists
    cookieStore.delete("webauthn-verified");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ success: true }); // Still return success to allow logout
  }
}
