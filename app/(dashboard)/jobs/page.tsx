"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Archive, RotateCcw } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

interface Job {
  id: string;
  name: string;
  type: string;
  salary: number;
  periodicity: string;
  payDay: number | null;
  status: string;
  currency: { code: string; symbol: string };
  account: { name: string };
}

async function fetchJobs(): Promise<Job[]> {
  const res = await fetch("/api/jobs");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function archiveJob(id: string): Promise<void> {
  const res = await fetch(`/api/jobs/${id}?action=archive`, { method: "POST" });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
}

async function activateJob(id: string): Promise<void> {
  const res = await fetch(`/api/jobs/${id}?action=activate`, {
    method: "POST",
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
}

function formatCurrency(value: number, symbol: string): string {
  return `${symbol}${new Intl.NumberFormat("es-CO").format(value)}`;
}

const statusLabels: Record<string, string> = {
  active: "Activo",
  archived: "Archivado",
  pending: "Pendiente",
};

const typeLabels: Record<string, string> = {
  fixed: "Fijo",
  freelance: "Freelance",
};

const periodicityLabels: Record<string, string> = {
  monthly: "Mensual",
  biweekly: "Quincenal",
  one_time: "Una vez",
};

export default function JobsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: jobs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
  });

  const archiveMutation = useMutation({
    mutationFn: archiveJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast({ title: "Trabajo archivado" });
    },
  });

  const activateMutation = useMutation({
    mutationFn: activateJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast({ title: "Trabajo activado" });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Card>
          <CardContent className="pt-6">
            {Array.from({ length: 3 }).map((_, i) => (
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
          <h1 className="text-3xl font-bold tracking-tight">Trabajos</h1>
          <p className="text-muted-foreground">
            Gestiona tus fuentes de ingreso
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Trabajo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los Trabajos</CardTitle>
          <CardDescription>{jobs?.length || 0} trabajo(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {jobs && jobs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Periodicidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Salario</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.name}</TableCell>
                    <TableCell>{typeLabels[job.type] || job.type}</TableCell>
                    <TableCell>
                      {periodicityLabels[job.periodicity] || job.periodicity}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          job.status === "active"
                            ? "success"
                            : job.status === "archived"
                              ? "secondary"
                              : "warning"
                        }
                      >
                        {statusLabels[job.status] || job.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(job.salary, job.currency.symbol)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {job.status === "active" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => archiveMutation.mutate(job.id)}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => activateMutation.mutate(job.id)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No hay trabajos registrados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
