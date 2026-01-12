"use client";

import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface Currency {
  id: string;
  code: string;
  symbol: string;
  name: string;
}

interface CurrencyPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currencies: Currency[];
  selectedIds: string[];
  sourceCurrencyId: string;
  onSave: (selectedIds: string[]) => void;
}

export function CurrencyPickerModal({
  open,
  onOpenChange,
  currencies,
  selectedIds,
  sourceCurrencyId,
  onSave,
}: CurrencyPickerModalProps) {
  const [localSelected, setLocalSelected] = useState<string[]>(selectedIds);

  // Reset local state when modal opens
  useEffect(() => {
    if (open) {
      setLocalSelected(selectedIds);
    }
  }, [open, selectedIds]);

  // Filter out source currency
  const availableCurrencies = currencies.filter(
    (c) => c.id !== sourceCurrencyId,
  );

  const handleToggle = (currencyId: string) => {
    setLocalSelected((prev) =>
      prev.includes(currencyId)
        ? prev.filter((id) => id !== currencyId)
        : [...prev, currencyId],
    );
  };

  const handleSelectAll = () => {
    const allIds = availableCurrencies.map((c) => c.id);
    setLocalSelected(allIds);
  };

  const handleClearAll = () => {
    setLocalSelected([]);
  };

  const handleSave = () => {
    onSave(localSelected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Seleccionar Monedas de Destino</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={localSelected.length === availableCurrencies.length}
            >
              <Check className="mr-1 h-4 w-4" />
              Seleccionar todas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={localSelected.length === 0}
            >
              <X className="mr-1 h-4 w-4" />
              Limpiar
            </Button>
          </div>

          {/* Currency list */}
          <div className="max-h-[300px] overflow-y-auto space-y-1">
            {availableCurrencies.map((currency) => {
              const isSelected = localSelected.includes(currency.id);
              return (
                <label
                  key={currency.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    isSelected
                      ? "bg-primary/5 border-primary"
                      : "hover:bg-muted/50",
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(currency.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{currency.code}</span>
                      <span className="text-muted-foreground text-sm">
                        {currency.symbol}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {currency.name}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Selected count */}
          <p className="text-sm text-muted-foreground text-center">
            {localSelected.length} moneda(s) seleccionada(s)
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
