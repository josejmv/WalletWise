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

export default function AccountTypesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AccountType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
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
      toast({
        title: "Error al eliminar",
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
    </div>
  );
}
