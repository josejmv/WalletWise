"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ChevronRight, ChevronDown } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
import { CategoryForm } from "./_components/category-form";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  parentId: string | null;
  isActive: boolean;
  parent?: { name: string } | null;
}

interface CategoryWithChildren extends Category {
  children: Category[];
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/categories");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
}

export default function CategoriesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // Organize categories into parent-children structure
  const organizedCategories = useMemo(() => {
    if (!categories) return { parents: [], standalone: [] };

    const parentMap = new Map<string, CategoryWithChildren>();
    const childrenByParent = new Map<string, Category[]>();
    const standalone: Category[] = [];

    // First pass: identify all categories and their children
    categories.forEach((cat) => {
      if (cat.parentId) {
        const children = childrenByParent.get(cat.parentId) || [];
        children.push(cat);
        childrenByParent.set(cat.parentId, children);
      }
    });

    // Second pass: create parent categories with their children
    categories.forEach((cat) => {
      if (!cat.parentId) {
        const children = childrenByParent.get(cat.id) || [];
        if (children.length > 0) {
          parentMap.set(cat.id, { ...cat, children });
        } else {
          standalone.push(cat);
        }
      }
    });

    return {
      parents: Array.from(parentMap.values()),
      standalone,
    };
  }, [categories]);

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Categoria eliminada" });
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

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingCategory(null);
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingCategory(null);
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderCategoryRow = (
    category: Category,
    isChild: boolean = false,
    hasChildren: boolean = false,
    isExpanded: boolean = false,
  ) => (
    <TableRow key={category.id} className={cn(isChild && "bg-muted/30")}>
      <TableCell className="font-medium">
        <div className={cn("flex items-center gap-2", isChild && "pl-8")}>
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => toggleExpanded(category.id)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          {!hasChildren && !isChild && <div className="w-6" />}
          {category.color && (
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: category.color }}
            />
          )}
          {category.icon && <span className="text-lg">{category.icon}</span>}
          <span>{category.name}</span>
          {!category.isActive && (
            <Badge variant="secondary" className="text-xs">
              Inactiva
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        {hasChildren && (
          <Badge variant="outline" className="text-xs">
            {(category as CategoryWithChildren).children.length} subcategorias
          </Badge>
        )}
        {isChild && (
          <span className="text-muted-foreground text-sm">Subcategoria</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(category)}
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteId(category.id)}
            title="Eliminar"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Card>
          <CardContent className="pt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full mb-2" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalCategories = categories?.length || 0;
  const parentCount = organizedCategories.parents.length;
  const standaloneCount = organizedCategories.standalone.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">
            Organiza tus gastos por categorias
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Categoria
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas las Categorias</CardTitle>
          <CardDescription>
            {totalCategories} categoria(s) total - {parentCount} con
            subcategorias, {standaloneCount} independientes
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {categories && categories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Parent categories with children */}
                {organizedCategories.parents.map((parent) => (
                  <>
                    {renderCategoryRow(
                      parent,
                      false,
                      true,
                      expandedIds.has(parent.id),
                    )}
                    {expandedIds.has(parent.id) &&
                      parent.children.map((child) =>
                        renderCategoryRow(child, true, false, false),
                      )}
                  </>
                ))}
                {/* Standalone categories (no children) */}
                {organizedCategories.standalone.map((category) =>
                  renderCategoryRow(category, false, false, false),
                )}
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
          <CategoryForm
            category={editingCategory}
            onSuccess={handleFormSuccess}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara permanentemente
              esta categoria.
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
