"use client";

import { useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { Fingerprint, Loader2, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface WebAuthnRegisterProps {
  onSuccess?: () => void;
}

export function WebAuthnRegister({ onSuccess }: WebAuthnRegisterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const { toast } = useToast();

  const handleRegister = async () => {
    setIsLoading(true);

    try {
      // Get registration options
      const optionsRes = await fetch("/api/webauthn/register/options");
      const { options, challenge } = await optionsRes.json();

      if (!optionsRes.ok) {
        throw new Error(options.error || "Error al obtener opciones");
      }

      // Start registration
      const attResp = await startRegistration({ optionsJSON: options });

      // Verify registration
      const verifyRes = await fetch("/api/webauthn/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: attResp, challenge }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(verifyData.error || "Error al verificar registro");
      }

      setIsRegistered(true);
      toast({
        title: "Passkey registrado",
        description: "Tu dispositivo biometrico ha sido configurado exitosamente.",
      });
      onSuccess?.();
    } catch (error) {
      console.error("WebAuthn registration error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al registrar passkey",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span>Passkey configurado</span>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleRegister}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Fingerprint className="mr-2 h-4 w-4" />
      )}
      Configurar Passkey / Biometria
    </Button>
  );
}
