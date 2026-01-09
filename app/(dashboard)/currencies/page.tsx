"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, DollarSign, Star } from "lucide-react";
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

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  isBase: boolean;
}

async function fetchCurrencies(): Promise<Currency[]> {
  const res = await fetch("/api/currencies");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

export default function CurrenciesPage() {
  const { data: currencies, isLoading } = useQuery({
    queryKey: ["currencies"],
    queryFn: fetchCurrencies,
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
          <h1 className="text-3xl font-bold tracking-tight">Monedas</h1>
          <p className="text-muted-foreground">
            Configura las monedas del sistema
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Moneda
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monedas Disponibles</CardTitle>
          <CardDescription>{currencies?.length || 0} moneda(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {currencies && currencies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Codigo</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Simbolo</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currencies.map((currency) => (
                  <TableRow key={currency.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        {currency.code}
                      </div>
                    </TableCell>
                    <TableCell>{currency.name}</TableCell>
                    <TableCell>{currency.symbol}</TableCell>
                    <TableCell>
                      {currency.isBase && (
                        <Badge variant="success" className="gap-1">
                          <Star className="h-3 w-3" />
                          Base
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No hay monedas registradas
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
