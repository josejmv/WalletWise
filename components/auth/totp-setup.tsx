"use client";

import { useState } from "react";
import { Loader2, Shield, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface TotpSetupProps {
  isEnabled?: boolean;
  onSuccess?: () => void;
}

export function TotpSetup({ isEnabled = false, onSuccess }: TotpSetupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"setup" | "verify">("setup");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSetup = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/2fa/totp/setup");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al configurar 2FA");
      }

      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep("verify");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al configurar 2FA"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (token.length !== 6) {
      setError("El codigo debe tener 6 digitos");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/2fa/totp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al verificar codigo");
      }

      toast({
        title: "2FA habilitado",
        description: "La autenticacion de dos factores ha sido configurada.",
      });
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al verificar codigo"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    if (token.length !== 6) {
      setError("El codigo debe tener 6 digitos");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/2fa/totp/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al deshabilitar 2FA");
      }

      toast({
        title: "2FA deshabilitado",
        description: "La autenticacion de dos factores ha sido deshabilitada.",
      });
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al deshabilitar 2FA"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setStep("setup");
    setQrCode(null);
    setSecret(null);
    setToken("");
    setError(null);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          {isEnabled ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              2FA Habilitado - Gestionar
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Configurar 2FA (Google Authenticator)
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEnabled
              ? "Gestionar 2FA"
              : step === "setup"
                ? "Configurar 2FA"
                : "Verificar 2FA"}
          </DialogTitle>
          <DialogDescription>
            {isEnabled
              ? "Ingresa el codigo de tu app de autenticacion para deshabilitar 2FA."
              : step === "setup"
                ? "La autenticacion de dos factores agrega una capa extra de seguridad."
                : "Escanea el codigo QR con Google Authenticator e ingresa el codigo."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {isEnabled ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="disable-token">Codigo de verificacion</Label>
              <Input
                id="disable-token"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl tracking-widest"
              />
            </div>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDisable}
              disabled={isLoading || token.length !== 6}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Deshabilitar 2FA
            </Button>
          </div>
        ) : step === "setup" ? (
          <Button onClick={handleSetup} disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generar Codigo QR
          </Button>
        ) : (
          <div className="space-y-4">
            {qrCode && (
              <div className="flex justify-center">
                <img src={qrCode} alt="QR Code" className="h-48 w-48" />
              </div>
            )}
            {secret && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Codigo manual (si no puedes escanear):
                </Label>
                <code className="block rounded bg-muted p-2 text-center text-xs font-mono">
                  {secret}
                </code>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="verify-token">Codigo de verificacion</Label>
              <Input
                id="verify-token"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl tracking-widest"
              />
            </div>
            <Button
              onClick={handleVerify}
              disabled={isLoading || token.length !== 6}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verificar y Habilitar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
