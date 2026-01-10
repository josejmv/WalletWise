"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Info, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface RateDetailsPopoverProps {
  officialRate?: number | null;
  customRate?: number | null;
  exchangeRate?: number | null;
  fromCurrency?: string;
  toCurrency?: string;
  amount?: number;
  className?: string;
}

export function RateDetailsPopover({
  officialRate,
  customRate,
  exchangeRate,
  fromCurrency,
  toCurrency,
  amount,
  className,
}: RateDetailsPopoverProps) {
  // Determine which rate was used
  const usedRate = customRate ?? exchangeRate ?? officialRate;
  const hasRateInfo = officialRate || customRate || exchangeRate;

  if (!hasRateInfo) {
    return (
      <span className={cn("text-muted-foreground text-xs", className)}>-</span>
    );
  }

  // Calculate difference if both rates are present
  const hasComparison = officialRate && customRate;
  const difference = hasComparison
    ? ((Number(customRate) - Number(officialRate)) / Number(officialRate)) * 100
    : null;

  const isPositive = difference !== null && difference > 0;
  const isNegative = difference !== null && difference < 0;

  // Calculate converted amount if we have all the info
  const convertedAmount =
    amount && usedRate ? Number(amount) * Number(usedRate) : null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1 text-xs hover:underline cursor-pointer",
            hasComparison
              ? isPositive
                ? "text-green-600"
                : isNegative
                  ? "text-red-600"
                  : "text-muted-foreground"
              : "text-muted-foreground",
            className,
          )}
        >
          <span>{Number(usedRate).toFixed(4)}</span>
          {hasComparison && (
            <>
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : isNegative ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
            </>
          )}
          <Info className="h-3 w-3 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-3">
          <div className="font-medium text-sm">Detalles de Tasa</div>

          {fromCurrency && toCurrency && (
            <div className="text-xs text-muted-foreground">
              {fromCurrency} → {toCurrency}
            </div>
          )}

          <div className="space-y-2">
            {officialRate && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tasa oficial</span>
                <span>{Number(officialRate).toFixed(4)}</span>
              </div>
            )}

            {customRate && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tasa custom</span>
                <span className="font-medium">
                  {Number(customRate).toFixed(4)}
                </span>
              </div>
            )}

            {exchangeRate && !customRate && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tasa aplicada</span>
                <span className="font-medium">
                  {Number(exchangeRate).toFixed(4)}
                </span>
              </div>
            )}
          </div>

          {hasComparison && difference !== null && (
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Diferencia</span>
                <Badge
                  variant={
                    isPositive
                      ? "success"
                      : isNegative
                        ? "destructive"
                        : "secondary"
                  }
                  className="text-xs"
                >
                  {isPositive ? "+" : ""}
                  {difference.toFixed(2)}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isPositive
                  ? "Tasa mejor que la oficial"
                  : isNegative
                    ? "Tasa peor que la oficial"
                    : "Sin diferencia"}
              </p>
            </div>
          )}

          {convertedAmount !== null && toCurrency && (
            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monto convertido</span>
                <span className="font-medium">
                  {convertedAmount.toLocaleString("es-CO", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {toCurrency}
                </span>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Simple badge component for showing if a transaction has a rate
export function RateBadge({
  hasRate,
  isCustom,
}: {
  hasRate: boolean;
  isCustom: boolean;
}) {
  if (!hasRate) return null;

  return (
    <Badge
      variant={isCustom ? "default" : "outline"}
      className={cn("text-xs", isCustom && "bg-blue-500/10 text-blue-600")}
    >
      {isCustom ? "Custom" : "Oficial"}
    </Badge>
  );
}
