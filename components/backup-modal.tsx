"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Download,
  Upload,
  Database,
  FileJson,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

interface ImportResult {
  success: boolean;
  message?: string;
  error?: string;
  imported?: Record<string, number>;
}

async function importBackup(file: File): Promise<ImportResult> {
  const content = await file.text();
  const backup = JSON.parse(content);

  const res = await fetch("/api/backup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(backup),
  });

  return res.json();
}

interface BackupModalProps {
  trigger: React.ReactNode;
}

export function BackupModal({ trigger }: BackupModalProps) {
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: importBackup,
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Backup importado",
          description: `Se importaron ${Object.values(result.imported || {}).reduce((a, b) => a + b, 0)} registros`,
        });
        queryClient.invalidateQueries();
        setOpen(false);
      } else {
        toast({
          title: "Error al importar",
          description: result.error,
          variant: "destructive",
        });
      }
      setImporting(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al importar",
        description: error.message,
        variant: "destructive",
      });
      setImporting(false);
    },
  });

  const handleExportJSON = () => {
    window.open("/api/backup?format=json", "_blank");
    toast({ title: "Descargando backup JSON..." });
  };

  const handleExportCSV = () => {
    window.open("/api/backup?format=csv", "_blank");
    toast({ title: "Descargando backup CSV..." });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      toast({
        title: "Formato invalido",
        description: "Solo se aceptan archivos JSON para importar",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    importMutation.mutate(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup y Restauracion
          </DialogTitle>
          <DialogDescription>
            Exporta todos tus datos para respaldo o importa un backup previo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Exportar Datos</h4>
            <p className="text-sm text-muted-foreground">
              Descarga una copia completa de todos tus datos.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleExportJSON}
              >
                <FileJson className="mr-2 h-4 w-4" />
                JSON
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleExportCSV}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                CSV
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Importar Datos</h4>
            <p className="text-sm text-muted-foreground">
              Restaura tus datos desde un archivo de backup JSON.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="default"
              className="w-full"
              onClick={handleImportClick}
              disabled={importing}
            >
              <Upload className="mr-2 h-4 w-4" />
              {importing ? "Importando..." : "Seleccionar archivo JSON"}
            </Button>
          </div>

          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Nota:</strong> Al importar, los datos existentes con el
              mismo ID seran actualizados. Los nuevos datos seran agregados.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
