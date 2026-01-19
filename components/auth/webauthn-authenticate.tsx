"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startAuthentication } from "@simplewebauthn/browser";
import { signIn } from "next-auth/react";
import { Fingerprint, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WebAuthnAuthenticateProps {
  onSuccess?: () => void;
  callbackUrl?: string;
}

export function WebAuthnAuthenticate({
  onSuccess,
  callbackUrl = "/dashboard",
}: WebAuthnAuthenticateProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthenticate = async () => {
    if (!email) {
      setError("Ingresa tu email");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get authentication options from server
      const optionsRes = await fetch("/api/webauthn/authenticate/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!optionsRes.ok) {
        const data = await optionsRes.json();
        throw new Error(data.error || "Error al obtener opciones");
      }

      const { options, challenge, userId } = await optionsRes.json();

      // Start WebAuthn authentication
      const authResponse = await startAuthentication({ optionsJSON: options });

      // Verify with server
      const verifyRes = await fetch("/api/webauthn/authenticate/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          response: authResponse,
          challenge,
          userId,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(verifyData.error || "Error al verificar");
      }

      const { verified, verificationToken, user } = verifyData;

      if (verified && user && verificationToken) {
        // Sign in the user with NextAuth using the WebAuthn verification token
        const result = await signIn("credentials", {
          email: user.email,
          webauthnToken: verificationToken,
          redirect: false,
        });

        if (result?.error) {
          throw new Error("Error al iniciar sesion");
        }

        onSuccess?.();
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error("WebAuthn auth error:", err);
      setError(
        err instanceof Error ? err.message : "Error al autenticar con passkey"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="webauthn-email">Email</Label>
        <Input
          id="webauthn-email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleAuthenticate}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Fingerprint className="mr-2 h-4 w-4" />
        )}
        Iniciar con Passkey
      </Button>
    </div>
  );
}
