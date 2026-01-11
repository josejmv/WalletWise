"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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

const categorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  parentId: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
    parentId: string | null;
  } | null;
  onSuccess: () => void;
  onCancel: () => void;
}

async function fetchCategories() {
  const res = await fetch("/api/categories?rootOnly=true");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function createCategory(data: CategoryFormData) {
  const res = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

async function updateCategory(id: string, data: CategoryFormData) {
  const res = await fetch(`/api/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export function CategoryForm({
  category,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const { toast } = useToast();
  const isEditing = !!category;

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories", "root"],
    queryFn: fetchCategories,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      parentId: "none",
      color: "#3b82f6",
      icon: "",
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        parentId: category.parentId ?? "none",
        color: category.color ?? "#3b82f6",
        icon: category.icon ?? "",
      });
    }
  }, [category, reset]);

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast({ title: "Categoria creada correctamente" });
      onSuccess();
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
    mutationFn: (data: CategoryFormData) => updateCategory(category!.id, data),
    onSuccess: () => {
      toast({ title: "Categoria actualizada correctamente" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar categoria",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    const submitData = {
      ...data,
      parentId: data.parentId === "none" ? undefined : data.parentId,
    };
    if (isEditing) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (loadingCategories) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  const availableParents =
    categories?.filter(
      (c: { id: string }) => !category || c.id !== category.id,
    ) || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" placeholder="Alimentacion" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="parentId">Categoria Padre (opcional)</Label>
        <Select
          value={watch("parentId") || "none"}
          onValueChange={(value) => {
            setValue("parentId", value === "none" ? undefined : value);
            // Inherit color from parent category
            if (value !== "none") {
              const parent = availableParents.find(
                (c: { id: string }) => c.id === value,
              );
              if (parent?.color) {
                setValue("color", parent.color);
              }
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sin categoria padre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin categoria padre</SelectItem>
            {availableParents.map(
              (cat: { id: string; name: string; color: string | null }) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="icon">Icono (emoji)</Label>
          <Input id="icon" placeholder="🍔" {...register("icon")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <div className="flex gap-2">
            <Input
              id="color"
              type="color"
              value={watch("color") || "#3b82f6"}
              onChange={(e) => setValue("color", e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input
              value={watch("color") || ""}
              onChange={(e) => setValue("color", e.target.value)}
              placeholder="#3b82f6"
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner className="mr-2 h-4 w-4" />}
          {isEditing ? "Guardar Cambios" : "Crear Categoria"}
        </Button>
      </div>
    </form>
  );
}
