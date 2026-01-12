"use client";

import { Button } from "@/components/ui/button";
import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalculatorKeypadProps {
  onInput: (value: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onCalculate: () => void;
  onParenthesis: () => void;
}

interface KeyConfig {
  label: string;
  value?: string;
  action?: "clear" | "backspace" | "calculate" | "parenthesis";
  className?: string;
  colSpan?: number;
  rowSpan?: number;
}

const KEYS: KeyConfig[][] = [
  [
    {
      label: "C",
      action: "clear",
      className: "bg-destructive/10 hover:bg-destructive/20 text-destructive",
    },
    { label: "()", action: "parenthesis", className: "bg-muted" },
    { label: "/", value: "/", className: "bg-muted" },
    { label: "*", value: "*", className: "bg-muted" },
    { label: "", action: "backspace", className: "bg-muted" },
  ],
  [
    { label: "7", value: "7" },
    { label: "8", value: "8" },
    { label: "9", value: "9" },
    { label: "-", value: "-", className: "bg-muted" },
    {
      label: "=",
      action: "calculate",
      className: "bg-primary text-primary-foreground hover:bg-primary/90",
      rowSpan: 4,
    },
  ],
  [
    { label: "4", value: "4" },
    { label: "5", value: "5" },
    { label: "6", value: "6" },
    { label: "+", value: "+", className: "bg-muted" },
  ],
  [
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: ".", value: "." },
  ],
  [
    { label: "0", value: "0", colSpan: 2 },
    { label: "00", value: "00" },
  ],
];

export function CalculatorKeypad({
  onInput,
  onClear,
  onBackspace,
  onCalculate,
  onParenthesis,
}: CalculatorKeypadProps) {
  const handleClick = (key: KeyConfig) => {
    if (key.action === "clear") {
      onClear();
    } else if (key.action === "backspace") {
      onBackspace();
    } else if (key.action === "calculate") {
      onCalculate();
    } else if (key.action === "parenthesis") {
      onParenthesis();
    } else if (key.value) {
      onInput(key.value);
    }
  };

  return (
    <div className="grid grid-cols-5 gap-2">
      {KEYS.flat().map((key, index) => {
        // Skip the equals button placeholder in rows after the first
        if (key.label === "=" && index > 9) return null;

        return (
          <Button
            key={`${key.label}-${index}`}
            variant="outline"
            className={cn(
              "h-14 text-lg font-semibold",
              key.colSpan === 2 && "col-span-2",
              key.rowSpan === 4 && "row-span-4",
              key.className,
            )}
            onClick={() => handleClick(key)}
          >
            {key.action === "backspace" ? (
              <Delete className="h-5 w-5" />
            ) : (
              key.label
            )}
          </Button>
        );
      })}
    </div>
  );
}
