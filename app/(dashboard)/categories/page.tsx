"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, Tags } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";

interface Category {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  parentId: string | null;
  parent?: { name: string };
  _count?: { children: number; expenses: number };
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/categories");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export default function CategoriesPage() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">
            Organiza tus gastos por categoria
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Categoria
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas las Categorias</CardTitle>
          <CardDescription>
            {categories?.length || 0} categoria(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories && categories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Categoria Padre</TableHead>
                  <TableHead className="text-right">Gastos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Tags className="h-4 w-4 text-muted-foreground" />
                        {category.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {category.color ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.color}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{category.parent?.name || "-"}</TableCell>
                    <TableCell className="text-right">
                      {category._count?.expenses || 0}
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
    </div>
  );
}
