"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Shield, Fingerprint, Smartphone, AlertTriangle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { WebAuthnRegister, TotpSetup } from "@/components/auth";
import { Badge } from "@/components/ui/badge";

interface UserSecurityInfo {
  totpEnabled: boolean;
  webauthnEnabled: boolean;
  authenticatorCount: number;
}

async function fetchSecurityInfo(): Promise<UserSecurityInfo> {
  const res = await fetch("/api/user/security");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export default function SecuritySettingsPage() {
  const { data: session } = useSession();

  const {
    data: securityInfo,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["user-security"],
    queryFn: fetchSecurityInfo,
    enabled: !!session,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const hasAny2FA =
    securityInfo?.totpEnabled || securityInfo?.webauthnEnabled;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seguridad</h1>
          <p className="text-muted-foreground">
            Configura la autenticacion de dos factores para proteger tu cuenta
          </p>
        </div>
      </div>

      {!hasAny2FA && (
        <Card className="border-warning bg-warning/10">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <p className="text-sm">
              Tu cuenta no tiene autenticacion de dos factores. Te recomendamos
              habilitar al menos un metodo para mayor seguridad.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Passkeys / WebAuthn */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5" />
                Passkeys / Biometria
              </span>
              {securityInfo?.webauthnEnabled && (
                <Badge variant="default" className="bg-green-600">
                  Activo
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Usa Face ID, Touch ID o Windows Hello para iniciar sesion de forma
              segura sin necesidad de contrasena.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {securityInfo?.webauthnEnabled && (
              <p className="text-sm text-muted-foreground">
                Tienes {securityInfo.authenticatorCount} dispositivo(s)
                registrado(s).
              </p>
            )}
            <WebAuthnRegister onSuccess={() => refetch()} />
          </CardContent>
        </Card>

        {/* TOTP / Google Authenticator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                App de Autenticacion (TOTP)
              </span>
              {securityInfo?.totpEnabled && (
                <Badge variant="default" className="bg-green-600">
                  Activo
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Usa Google Authenticator, Authy o cualquier app compatible para
              generar codigos de verificacion de 6 digitos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TotpSetup
              isEnabled={securityInfo?.totpEnabled}
              onSuccess={() => refetch()}
            />
          </CardContent>
        </Card>
      </div>

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Consejos de Seguridad</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">1.</span>
              <span>
                <strong>Passkeys</strong> son la opcion mas segura y conveniente.
                Usa tu huella digital o Face ID para iniciar sesion.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">2.</span>
              <span>
                <strong>TOTP</strong> es una alternativa segura si tu dispositivo
                no soporta biometria o quieres un respaldo adicional.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">3.</span>
              <span>
                Guarda los codigos de recuperacion en un lugar seguro. Sin ellos,
                podrias perder acceso a tu cuenta si pierdes tu dispositivo.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">4.</span>
              <span>
                Nunca compartas tus codigos de verificacion con nadie. WalletWise
                nunca te pedira estos codigos por email o telefono.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
