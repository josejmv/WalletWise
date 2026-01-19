"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Loader2, Smartphone, Monitor, Key, Cloud } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";

interface Authenticator {
  id: string;
  name: string;
  deviceType: string;
  transports: string[];
  backedUp: boolean;
  createdAt: string;
}

interface PasskeyListProps {
  onDelete?: () => void;
}

async function fetchAuthenticators(): Promise<{ authenticators: Authenticator[] }> {
  const res = await fetch("/api/webauthn/authenticators");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

async function deleteAuthenticator(id: string): Promise<void> {
  const res = await fetch(`/api/webauthn/authenticators/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
}

function getDeviceIcon(transports: string[]) {
  if (transports.includes("hybrid")) {
    return <Smartphone className="h-4 w-4" />;
  }
  if (transports.includes("internal")) {
    return <Monitor className="h-4 w-4" />;
  }
  return <Key className="h-4 w-4" />;
}

function getTransportLabel(transports: string[]): string {
  if (transports.includes("hybrid")) {
    return "Telefono (QR)";
  }
  if (transports.includes("internal")) {
    return "Este dispositivo";
  }
  if (transports.includes("usb")) {
    return "Llave USB";
  }
  return "Passkey";
}

export function PasskeyList({ onDelete }: PasskeyListProps) {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["authenticators"],
    queryFn: fetchAuthenticators,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAuthenticator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authenticators"] });
      queryClient.invalidateQueries({ queryKey: ["user-security"] });
      setDeleteId(null);
      onDelete?.();
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
        Error al cargar dispositivos
      </div>
    );
  }

  const authenticators = data?.authenticators || [];

  if (authenticators.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No tienes passkeys registrados.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {authenticators.map((auth, index) => (
          <div
            key={auth.id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                {getDeviceIcon(auth.transports)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">Passkey {index + 1}</p>
                  {auth.backedUp && (
                    <Cloud className="h-3 w-3 text-muted-foreground" title="Respaldado en la nube" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getTransportLabel(auth.transports)} · {auth.deviceType}
                </p>
                <p className="text-xs text-muted-foreground">
                  Creado {formatDistanceToNow(new Date(auth.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setDeleteId(auth.id)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Passkey</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estas seguro de eliminar este passkey? No podras usarlo para
              iniciar sesion. Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
