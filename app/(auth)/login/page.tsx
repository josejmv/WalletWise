import Link from "next/link";
import { Suspense } from "react";
import {
  AuthCard,
  LoginForm,
  SocialButtons,
  WebAuthnAuthenticate,
} from "@/components/auth";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Iniciar Sesion - WalletWise",
  description: "Inicia sesion en tu cuenta de WalletWise",
};

function LoginContent() {
  return (
    <AuthCard
      title="Bienvenido de vuelta"
      description="Inicia sesion en tu cuenta"
      footer={
        <>
          No tienes cuenta?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Registrate
          </Link>
        </>
      }
    >
      <SocialButtons />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            o usa passkey
          </span>
        </div>
      </div>
      <WebAuthnAuthenticate />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            o continua con email
          </span>
        </div>
      </div>
      <LoginForm />
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginContent />
    </Suspense>
  );
}
