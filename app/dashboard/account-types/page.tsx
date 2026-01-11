"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  CreditCard,
  Landmark,
  Wallet,
  Banknote,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";

interface AccountType {
  id: string;
  name: string;
  type: "bank" | "cash" | "digital_wallet" | "credit_card";
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

const typeConfig = {
  bank: { label: "Banco", icon: Landmark, variant: "default" as const },
  cash: { label: "Efectivo", icon: Banknote, variant: "secondary" as const },
  digital_wallet: {
    label: "Billetera Digital",
    icon: Wallet,
    variant: "outline" as const,
  },
  credit_card: {
    label: "Tarjeta de Credito",
    icon: CreditCard,
    variant: "destructive" as const,
  },
};

async function fetchAccountTypes(): Promise<AccountType[]> {
  const res = await fetch("/api/account-types");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function createAccountType(input: {
  name: string;
  type: string;
  description?: string;
}) {
  const res = await fetch("/api/account-types", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function updateAccountType(
  id: string,
  input: { name: string; type: string; description?: string },
) {
  const res = await fetch(`/api/account-types/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function deleteAccountType(id: string): Promise<void> {
  const res = await fetch(`/api/account-types/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
}

// v1.3.0: Delete with move accounts to another type
async function deleteWithMove(id: string, moveToTypeId: string): Promise<void> {
  const res = await fetch(`/api/account-types/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moveToTypeId }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
}

export default function AccountTypesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AccountType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // v1.3.0: State for move accounts modal
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<AccountType | null>(null);
  const [moveToTypeId, setMoveToTypeId] = useState("");
  const [accountCount, setAccountCount] = useState(0);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accountTypes, isLoading } = useQuery({
    queryKey: ["account-types"],
    queryFn: fetchAccountTypes,
  });

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setType(editingItem.type);
      setDescription(editingItem.description || "");
    } else {
      setName("");
      setType("");
      setDescription("");
    }
  }, [editingItem]);

  const createMutation = useMutation({
    mutationFn: createAccountType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-types"] });
      toast({ title: "Tipo de cuenta creado" });
      handleCloseForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateAccountType>[1];
    }) => updateAccountType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-types"] });
      toast({ title: "Tipo de cuenta actualizado" });
      handleCloseForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccountType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-types"] });
      toast({ title: "Tipo de cuenta eliminado" });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      // v1.3.0: Check if error is due to associated accounts
      const match = error.message.match(/hay (\d+) cuenta\(s\) asociada\(s\)/);
      if (match && deleteId) {
        const count = parseInt(match[1], 10);
        const typeToMove = accountTypes?.find((t) => t.id === deleteId);
        if (typeToMove) {
          setTypeToDelete(typeToMove);
          setAccountCount(count);
          setMoveModalOpen(true);
          setDeleteId(null);
          return;
        }
      }
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // v1.3.0: Mutation for delete with move
  const deleteWithMoveMutation = useMutation({
    mutationFn: ({ id, moveToTypeId }: { id: string; moveToTypeId: string }) =>
      deleteWithMove(id, moveToTypeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-types"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast({ title: "Cuentas movidas y tipo eliminado" });
      setMoveModalOpen(false);
      setTypeToDelete(null);
      setMoveToTypeId("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error al mover cuentas",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingItem(null);
    setName("");
    setType("");
    setDescription("");
  };

  const handleEdit = (item: AccountType) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      type,
      ...(description && { description }),
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="pt-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full mb-2" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tipos de Cuenta</h1>
          <p className="text-muted-foreground">
            Gestiona los tipos de cuentas disponibles
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Tipo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tipos de Cuenta</CardTitle>
          <CardDescription>
            {accountTypes?.length || 0} tipo(s) registrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accountTypes && accountTypes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripcion</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accountTypes.map((accountType) => {
                  const config = typeConfig[accountType.type];
                  const Icon = config.icon;

                  return (
                    <TableRow key={accountType.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          {accountType.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {accountType.description || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            accountType.isActive ? "success" : "secondary"
                          }
                        >
                          {accountType.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(accountType)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(accountType.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No hay tipos de cuenta registrados
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={handleCloseForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Tipo de Cuenta" : "Nuevo Tipo de Cuenta"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Cuenta de Ahorros"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Banco</SelectItem>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="digital_wallet">
                    Billetera Digital
                  </SelectItem>
                  <SelectItem value="credit_card">
                    Tarjeta de Credito
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripcion (opcional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripcion del tipo de cuenta"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingItem ? "Guardar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Tipo de Cuenta</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara permanentemente
              este tipo de cuenta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* v1.3.0: Modal for moving accounts before deletion */}
      <Dialog
        open={moveModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setMoveModalOpen(false);
            setTypeToDelete(null);
            setMoveToTypeId("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Mover Cuentas Asociadas
            </DialogTitle>
            <DialogDescription>
              El tipo &quot;{typeToDelete?.name}&quot; tiene {accountCount}{" "}
              cuenta(s) asociada(s). Selecciona otro tipo para mover las cuentas
              antes de eliminar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="moveToType">Mover cuentas a:</Label>
              <Select value={moveToTypeId} onValueChange={setMoveToTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo de cuenta" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes
                    ?.filter((t) => t.id !== typeToDelete?.id && t.isActive)
                    .map((t) => {
                      const config = typeConfig[t.type];
                      const Icon = config.icon;
                      return (
                        <SelectItem key={t.id} value={t.id}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {t.name}
                          </div>
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setMoveModalOpen(false);
                setTypeToDelete(null);
                setMoveToTypeId("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={!moveToTypeId || deleteWithMoveMutation.isPending}
              onClick={() => {
                if (typeToDelete && moveToTypeId) {
                  deleteWithMoveMutation.mutate({
                    id: typeToDelete.id,
                    moveToTypeId,
                  });
                }
              }}
            >
              {deleteWithMoveMutation.isPending && (
                <Spinner className="mr-2 h-4 w-4" />
              )}
              Mover y Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
