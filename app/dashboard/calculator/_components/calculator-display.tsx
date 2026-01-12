"use client";

import { cn } from "@/lib/utils";
import { formatResult } from "@/lib/calculator";

interface CalculatorDisplayProps {
  expression: string;
  result: number | null;
  error: string | null;
  currencySymbol: string;
}

export function CalculatorDisplay({
  expression,
  result,
  error,
  currencySymbol,
}: CalculatorDisplayProps) {
  return (
    <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
      {/* Expression line */}
      <div className="min-h-[1.5rem] text-right text-muted-foreground text-sm font-mono">
        {expression || "0"}
        {expression && result !== null && " ="}
      </div>

      {/* Result line */}
      <div
        className={cn(
          "text-right text-3xl sm:text-4xl font-bold font-mono tracking-tight",
          error && "text-destructive",
          result !== null && result < 0 && "text-red-500",
        )}
      >
        {error ? (
          <span className="text-lg sm:text-xl">{error}</span>
        ) : result !== null ? (
          <span>
            {currencySymbol} {formatResult(result)}
          </span>
        ) : (
          <span className="text-muted-foreground">{currencySymbol} 0</span>
        )}
      </div>
    </div>
  );
}
