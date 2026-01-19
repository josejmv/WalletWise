import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuthCard } from "@/components/auth";
import { Verify2FAForm } from "./verify-2fa-form";

export const metadata = {
  title: "Verificacion 2FA - WalletWise",
  description: "Verifica tu identidad con 2FA",
};

export default async function Verify2FAPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const callbackUrl = params.callbackUrl || "/dashboard";

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check if user has 2FA enabled
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totpEnabled: true },
  });

  if (!user?.totpEnabled) {
    // No 2FA required, redirect to dashboard
    redirect(callbackUrl);
  }

  return (
    <AuthCard
      title="Verificacion de Seguridad"
      description="Tu cuenta tiene 2FA habilitado"
    >
      <Verify2FAForm userId={session.user.id} callbackUrl={callbackUrl} />
    </AuthCard>
  );
}
