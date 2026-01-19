import Link from "next/link";
import { AuthCard, RegisterForm, SocialButtons } from "@/components/auth";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Crear Cuenta - WalletWise",
  description: "Crea tu cuenta gratuita en WalletWise",
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Crea tu cuenta"
      description="Empieza a gestionar tus finanzas hoy"
      footer={
        <>
          Ya tienes cuenta?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Inicia sesion
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
            o registrate con email
          </span>
        </div>
      </div>
      <RegisterForm />
      <p className="text-center text-xs text-muted-foreground">
        Al crear una cuenta, aceptas nuestros{" "}
        <Link href="/terms" className="text-primary hover:underline">
          Terminos de Servicio
        </Link>{" "}
        y{" "}
        <Link href="/privacy" className="text-primary hover:underline">
          Politica de Privacidad
        </Link>
      </p>
    </AuthCard>
  );
}
