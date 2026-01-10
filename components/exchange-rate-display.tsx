"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, ArrowRightLeft, Info } from "lucide-react";
import {
  compareRates,
  formatRate,
  calculateConversion,
} from "@/lib/exchange-rates";
import { cn } from "@/lib/utils";

interface ExchangeRateDisplayProps {
  amount: number;
  fromCurrencyCode: string;
  fromCurrencySymbol: string;
  toCurrencyCode: string;
  toCurrencySymbol: string;
  officialRate: number | null;
  isLoading?: boolean;
  onCustomRateChange?: (customRate: number | null) => void;
  onConvertedAmountChange?: (amount: number) => void;
  showCustomInput?: boolean;
  className?: string;
}

export function ExchangeRateDisplay({
  amount,
  fromCurrencyCode,
  fromCurrencySymbol,
  toCurrencyCode,
  toCurrencySymbol,
  officialRate,
  isLoading = false,
  onCustomRateChange,
  onConvertedAmountChange,
  showCustomInput = true,
  className,
}: ExchangeRateDisplayProps) {
  const [customRateInput, setCustomRateInput] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const customRate = customRateInput ? parseFloat(customRateInput) : null;
  const activeRate = useCustom && customRate ? customRate : officialRate;
  const convertedAmount = activeRate
    ? calculateConversion(amount, activeRate)
    : 0;

  // Notify parent of rate changes
  useEffect(() => {
    onCustomRateChange?.(useCustom ? customRate : null);
  }, [customRate, useCustom, onCustomRateChange]);

  useEffect(() => {
    onConvertedAmountChange?.(convertedAmount);
  }, [convertedAmount, onConvertedAmountChange]);

  // Calculate comparison when both rates exist
  const comparison =
    officialRate && customRate
      ? compareRates(officialRate, customRate, amount, true)
      : null;

  if (isLoading) {
    return (
      <div className={cn("space-y-3 rounded-lg border p-4", className)}>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-48" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-3 rounded-lg border p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <ArrowRightLeft className="h-4 w-4" />
          <span>
            {fromCurrencyCode} a {toCurrencyCode}
          </span>
        </div>
        {officialRate && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="text-xs">
                  Tasa: {formatRate(officialRate)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  1 {fromCurrencyCode} = {formatRate(officialRate)}{" "}
                  {toCurrencyCode}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* No rate warning */}
      {!officialRate && !customRate && (
        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
          <Info className="h-4 w-4" />
          <span>No hay tasa registrada. Ingresa una tasa manual.</span>
        </div>
      )}

      {/* Custom rate input */}
      {showCustomInput && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Tasa personalizada (opcional)
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              step="any"
              placeholder={
                officialRate ? formatRate(officialRate) : "Ingresa tasa"
              }
              value={customRateInput}
              onChange={(e) => {
                setCustomRateInput(e.target.value);
                setUseCustom(!!e.target.value);
              }}
              className="flex-1"
            />
            {customRateInput && (
              <button
                type="button"
                onClick={() => {
                  setCustomRateInput("");
                  setUseCustom(false);
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Usar oficial
              </button>
            )}
          </div>
        </div>
      )}

      {/* Converted amount */}
      {activeRate && amount > 0 && (
        <div className="rounded-md bg-muted/50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {fromCurrencySymbol}
              {amount.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-lg font-semibold">
              {toCurrencySymbol}
              {convertedAmount.toLocaleString("es-CO", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Comparison badge */}
          {comparison && (
            <div className="mt-2 flex items-center gap-2">
              <Badge
                variant={comparison.isSaving ? "default" : "destructive"}
                className={cn(
                  "text-xs",
                  comparison.isSaving && "bg-green-600 hover:bg-green-700",
                )}
              >
                {comparison.isSaving ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3" />
                )}
                {comparison.isSaving ? "Ahorro" : "Extra"} {toCurrencySymbol}
                {comparison.difference.toLocaleString("es-CO", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Badge>
              <span className="text-xs text-muted-foreground">
                ({comparison.isSaving ? "+" : "-"}
                {comparison.differencePercent.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version for tables/lists
interface ExchangeRateCompactProps {
  officialRate: number;
  customRate?: number | null;
  fromCurrencyCode: string;
  toCurrencyCode: string;
  amount: number;
  className?: string;
}

export function ExchangeRateCompact({
  officialRate,
  customRate,
  fromCurrencyCode,
  toCurrencyCode,
  amount,
  className,
}: ExchangeRateCompactProps) {
  const activeRate = customRate || officialRate;
  const comparison = customRate
    ? compareRates(officialRate, customRate, amount, true)
    : null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-1 text-sm", className)}>
            <span className="font-mono">{formatRate(activeRate)}</span>
            {comparison && (
              <Badge
                variant="outline"
                className={cn(
                  "h-5 px-1 text-[10px]",
                  comparison.isSaving
                    ? "border-green-500 text-green-600"
                    : "border-red-500 text-red-600",
                )}
              >
                {comparison.isSaving ? "+" : "-"}
                {comparison.differencePercent.toFixed(1)}%
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="text-xs">
          <p>
            1 {fromCurrencyCode} = {formatRate(activeRate)} {toCurrencyCode}
          </p>
          {comparison && (
            <p className="mt-1">
              Tasa oficial: {formatRate(officialRate)}
              <br />
              Tasa usada: {formatRate(customRate!)}
              <br />
              {comparison.isSaving ? "Ahorro" : "Extra"}:{" "}
              {comparison.differencePercent.toFixed(2)}%
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
