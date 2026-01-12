"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  AlertCircle,
  ArrowRightLeft,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatResult } from "@/lib/calculator";
import type { RateResult } from "@/lib/currency-utils";

interface Currency {
  id: string;
  code: string;
  symbol: string;
  name: string;
}

interface ConversionItemData {
  currency: Currency;
  rate: RateResult | null;
  convertedAmount: number | null;
}

interface ConversionListProps {
  conversions: ConversionItemData[];
  sourceAmount: number | null;
  onEditCurrencies: () => void;
}

export function ConversionList({
  conversions,
  sourceAmount,
  onEditCurrencies,
}: ConversionListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (currency: Currency, amount: number) => {
    const text = `${currency.symbol} ${formatResult(amount)}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(currency.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSourceLabel = (rate: RateResult) => {
    if (rate.intermediateRoute) {
      return `via ${rate.intermediateRoute.currencyCode}`;
    }
    if (rate.isInverse) {
      return "inversa";
    }
    return rate.source;
  };

  // v1.5.0: Get detailed tooltip content for intermediate routes
  const getTooltipContent = (rate: RateResult) => {
    if (rate.intermediateRoute) {
      const { currencyCode, rate1, rate2 } = rate.intermediateRoute;
      return (
        <div className="space-y-1">
          <p className="font-medium">Via {currencyCode}</p>
          <p className="text-xs">Tasa 1: {formatResult(rate1, 6)}</p>
          <p className="text-xs">Tasa 2: {formatResult(rate2, 6)}</p>
          <p className="text-xs border-t pt-1 mt-1">
            Final: {formatResult(rate1, 4)} × {formatResult(rate2, 4)} ={" "}
            {formatResult(rate.rate, 6)}
          </p>
        </div>
      );
    }
    return <p>Tasa: {getSourceLabel(rate)}</p>;
  };

  if (conversions.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-muted-foreground">
          No hay monedas seleccionadas para conversion
        </p>
        <Button variant="outline" onClick={onEditCurrencies}>
          <Settings2 className="mr-2 h-4 w-4" />
          Seleccionar Monedas
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Conversiones
        </h3>
        <Button variant="ghost" size="sm" onClick={onEditCurrencies}>
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-1">
        {conversions.map(({ currency, rate, convertedAmount }) => (
          <div
            key={currency.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border bg-card",
              "hover:bg-muted/50 transition-colors cursor-pointer",
              sourceAmount === null && "opacity-50",
            )}
            onClick={() => {
              if (convertedAmount !== null) {
                handleCopy(currency, convertedAmount);
              }
            }}
          >
            <div className="flex items-center gap-3">
              <div className="font-medium w-14">{currency.code}</div>
              {rate ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-xs cursor-help">
                      <ArrowRightLeft className="mr-1 h-3 w-3" />
                      {formatResult(rate.rate, 4)}
                      {rate.intermediateRoute && (
                        <span className="ml-1 text-muted-foreground">
                          ({rate.intermediateRoute.currencyCode})
                        </span>
                      )}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>{getTooltipContent(rate)}</TooltipContent>
                </Tooltip>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Sin tasa
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "font-semibold tabular-nums",
                  convertedAmount !== null &&
                    convertedAmount < 0 &&
                    "text-red-500",
                )}
              >
                {convertedAmount !== null ? (
                  <>
                    {currency.symbol} {formatResult(convertedAmount)}
                  </>
                ) : (
                  <span className="text-muted-foreground">--</span>
                )}
              </span>
              {copiedId === currency.id ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
