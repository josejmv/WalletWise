"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  RefreshCw,
  Calculator as CalculatorIcon,
  Route,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { evaluate, getSmartParenthesis } from "@/lib/calculator";
import { useUserConfigContext } from "@/contexts/user-config-context";
import { CalculatorDisplay } from "./_components/calculator-display";
import { CalculatorKeypad } from "./_components/calculator-keypad";
import { ConversionList } from "./_components/conversion-list";
import { CurrencyPickerModal } from "./_components/currency-picker-modal";
import type { RateResult } from "@/lib/currency-utils";

interface Currency {
  id: string;
  code: string;
  symbol: string;
  name: string;
}

interface RatesResponse {
  success: boolean;
  data: Record<string, RateResult | null>;
}

const STORAGE_KEY = "calculator-selected-currencies";

async function fetchCurrencies(): Promise<Currency[]> {
  const res = await fetch("/api/currencies");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function fetchRates(
  sourceCurrencyId: string,
  targetCurrencyIds: string[],
  intermediateCurrencyId?: string,
): Promise<Record<string, RateResult | null>> {
  if (targetCurrencyIds.length === 0) return {};

  const res = await fetch("/api/calculator/rates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sourceCurrencyId,
      targetCurrencyIds,
      // v1.5.0: Pass intermediate currency if selected
      ...(intermediateCurrencyId && { intermediateCurrencyId }),
    }),
  });
  const data: RatesResponse = await res.json();
  if (!data.success) throw new Error("Error fetching rates");
  return data.data;
}

export default function CalculatorPage() {
  const { config } = useUserConfigContext();

  // Calculator state
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Currency state
  const [sourceCurrencyId, setSourceCurrencyId] = useState<string>("");
  const [targetCurrencyIds, setTargetCurrencyIds] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  // v1.5.0: Optional intermediate currency for forced routing
  const [intermediateCurrencyId, setIntermediateCurrencyId] = useState<
    string | undefined
  >(undefined);

  // Fetch currencies
  const { data: currencies, isLoading: loadingCurrencies } = useQuery({
    queryKey: ["currencies"],
    queryFn: fetchCurrencies,
  });

  // Fetch rates
  const {
    data: rates,
    isLoading: loadingRates,
    refetch: refetchRates,
  } = useQuery({
    queryKey: [
      "calculator-rates",
      sourceCurrencyId,
      targetCurrencyIds,
      intermediateCurrencyId,
    ],
    queryFn: () =>
      fetchRates(sourceCurrencyId, targetCurrencyIds, intermediateCurrencyId),
    enabled: !!sourceCurrencyId && targetCurrencyIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Initialize source currency from config
  useEffect(() => {
    if (config?.baseCurrencyId && !sourceCurrencyId) {
      setSourceCurrencyId(config.baseCurrencyId);
    }
  }, [config?.baseCurrencyId, sourceCurrencyId]);

  // Load saved target currencies from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTargetCurrencyIds(parsed);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save target currencies to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(targetCurrencyIds));
    } catch {
      // Ignore localStorage errors
    }
  }, [targetCurrencyIds]);

  // Calculate result when expression changes
  const calculate = useCallback(() => {
    const evalResult = evaluate(expression);
    if (evalResult.success) {
      setResult(evalResult.value);
      setError(null);
    } else {
      setResult(null);
      setError(evalResult.error);
    }
  }, [expression]);

  // Auto-calculate with debounce
  useEffect(() => {
    const timer = setTimeout(calculate, 150);
    return () => clearTimeout(timer);
  }, [calculate]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key >= "0" && e.key <= "9") {
        setExpression((prev) => prev + e.key);
      } else if (["+", "-", "*", "/", ".", "(", ")"].includes(e.key)) {
        setExpression((prev) => prev + e.key);
      } else if (e.key === "Enter") {
        calculate();
      } else if (e.key === "Backspace") {
        setExpression((prev) => prev.slice(0, -1));
      } else if (e.key === "Escape") {
        setExpression("");
        setResult(null);
        setError(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [calculate]);

  // Handlers
  const handleInput = (value: string) => {
    setExpression((prev) => prev + value);
  };

  const handleClear = () => {
    setExpression("");
    setResult(null);
    setError(null);
  };

  const handleBackspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleParenthesis = () => {
    const paren = getSmartParenthesis(expression);
    setExpression((prev) => prev + paren);
  };

  const handleSaveCurrencies = (ids: string[]) => {
    setTargetCurrencyIds(ids);
  };

  // Get source currency info
  const sourceCurrency = currencies?.find((c) => c.id === sourceCurrencyId);

  // Build conversions data
  const conversions =
    currencies
      ?.filter((c) => targetCurrencyIds.includes(c.id))
      .map((currency) => ({
        currency,
        rate: rates?.[currency.id] ?? null,
        convertedAmount:
          result !== null && rates?.[currency.id]
            ? result * rates[currency.id]!.rate
            : null,
      })) ?? [];

  if (loadingCurrencies) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Calculadora
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Calcula y convierte entre monedas
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calculator Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalculatorIcon className="h-5 w-5" />
                Calculadora
              </CardTitle>
              <Select
                value={sourceCurrencyId}
                onValueChange={setSourceCurrencyId}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Moneda" />
                </SelectTrigger>
                <SelectContent>
                  {currencies?.map((currency) => (
                    <SelectItem key={currency.id} value={currency.id}>
                      {currency.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <CalculatorDisplay
              expression={expression}
              result={result}
              error={error}
              currencySymbol={sourceCurrency?.symbol ?? "$"}
            />
            <CalculatorKeypad
              onInput={handleInput}
              onClear={handleClear}
              onBackspace={handleBackspace}
              onCalculate={calculate}
              onParenthesis={handleParenthesis}
            />
          </CardContent>
        </Card>

        {/* Conversions Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Conversiones</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchRates()}
                disabled={loadingRates || targetCurrencyIds.length === 0}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loadingRates ? "animate-spin" : ""}`}
                />
                Actualizar
              </Button>
            </div>
            {/* v1.5.0: Intermediate currency selector */}
            <div className="flex items-center gap-2 mt-2">
              <Route className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Via:</span>
              <Select
                value={intermediateCurrencyId ?? "auto"}
                onValueChange={(value) =>
                  setIntermediateCurrencyId(
                    value === "auto" ? undefined : value,
                  )
                }
              >
                <SelectTrigger className="w-[130px] h-8">
                  <SelectValue placeholder="Automatico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Automatico</SelectItem>
                  {currencies
                    ?.filter((c) => c.id !== sourceCurrencyId)
                    .map((currency) => (
                      <SelectItem key={currency.id} value={currency.id}>
                        {currency.code}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {intermediateCurrencyId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setIntermediateCurrencyId(undefined)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ConversionList
              conversions={conversions}
              sourceAmount={result}
              onEditCurrencies={() => setPickerOpen(true)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Currency Picker Modal */}
      <CurrencyPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        currencies={currencies ?? []}
        selectedIds={targetCurrencyIds}
        sourceCurrencyId={sourceCurrencyId}
        onSave={handleSaveCurrencies}
      />
    </div>
  );
}
