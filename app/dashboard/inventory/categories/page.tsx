"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, FolderTree } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

interface InventoryCategory {
  id: string;
  name: string;
  _count?: { items: number };
}

async function fetchCategories(): Promise<InventoryCategory[]> {
  const res = await fetch("/api/inventory-categories");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function createCategory(name: string): Promise<InventoryCategory> {
  const res = await fetch("/api/inventory-categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function updateCategory(
  id: string,
  name: string,
): Promise<InventoryCategory> {
  const res = await fetch(`/api/inventory-categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`/api/inventory-categories/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
}

export default function InventoryCategoriesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<InventoryCategory | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["inventory-categories"],
    queryFn: fetchCategories,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-categories"] });
      toast({ title: "Categoria creada correctamente" });
      handleCloseForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear categoria",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateCategory(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-categories"] });
      toast({ title: "Categoria actualizada correctamente" });
      handleCloseForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar categoria",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-categories"] });
      toast({ title: "Categoria eliminada correctamente" });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar categoria",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleOpenForm = (category?: InventoryCategory) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
    } else {
      setEditingCategory(null);
      setName("");
    }
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingCategory(null);
    setName("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, name });
    } else {
      createMutation.mutate(name);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Categorias de Inventario
          </h1>
          <p className="text-muted-foreground">
            Organiza tus items de inventario por categorias
          </p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Categoria
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Categorias
          </CardTitle>
          <CardDescription>
            {categories?.length || 0} categoria(s) registrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories && categories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell className="text-right">
                      {category._count?.items || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenForm(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(category.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No hay categorias registradas
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={handleCloseForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar Categoria" : "Nueva Categoria"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre de la categoria"
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
                {editingCategory ? "Guardar" : "Crear"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara la categoria
              permanentemente.
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
