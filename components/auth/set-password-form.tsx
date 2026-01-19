"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SetPasswordFormProps {
  onSuccess?: () => void;
}

export function SetPasswordForm({ onSuccess }: SetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordRequirements = [
    { label: "Al menos 8 caracteres", valid: password.length >= 8 },
    { label: "Una letra mayuscula", valid: /[A-Z]/.test(password) },
    { label: "Una letra minuscula", valid: /[a-z]/.test(password) },
    { label: "Un numero", valid: /\d/.test(password) },
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.valid);
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allRequirementsMet) {
      setError("La contrasena no cumple los requisitos");
      return;
    }

    if (!passwordsMatch) {
      setError("Las contrasenas no coinciden");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al configurar contraseña");
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-green-500/10 p-3 text-sm text-green-600">
        <Check className="h-4 w-4" />
        Contrasena configurada exitosamente. Ahora puedes iniciar sesion con email y contrasena.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="new-password">Nueva Contrasena</Label>
        <div className="relative">
          <Input
            id="new-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            placeholder="Ingresa tu nueva contrasena"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirmar Contrasena</Label>
        <Input
          id="confirm-password"
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          placeholder="Confirma tu contrasena"
        />
        {confirmPassword && !passwordsMatch && (
          <p className="text-xs text-destructive">Las contrasenas no coinciden</p>
        )}
      </div>

      <div className="rounded-md bg-muted p-3">
        <p className="mb-2 text-xs font-medium">Requisitos de la contrasena:</p>
        <ul className="space-y-1">
          {passwordRequirements.map((req, idx) => (
            <li
              key={idx}
              className={`flex items-center gap-2 text-xs ${
                req.valid ? "text-green-600" : "text-muted-foreground"
              }`}
            >
              {req.valid ? (
                <Check className="h-3 w-3" />
              ) : (
                <div className="h-3 w-3 rounded-full border" />
              )}
              {req.label}
            </li>
          ))}
        </ul>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || !allRequirementsMet || !passwordsMatch}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Lock className="mr-2 h-4 w-4" />
        )}
        Configurar Contraseña
      </Button>
    </form>
  );
}
