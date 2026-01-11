"use client";

import * as React from "react";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUserConfigContext } from "@/contexts/user-config-context";

// Map our date formats to date-fns format strings
const DATE_FORMAT_MAP: Record<string, string> = {
  "DD/MM/YYYY": "dd/MM/yyyy",
  "MM/DD/YYYY": "MM/dd/yyyy",
  "YYYY-MM-DD": "yyyy-MM-dd",
};

interface DatePickerProps {
  value?: Date | string;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  disabled = false,
  className,
  id,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const { config } = useUserConfigContext();

  const dateFormat = config?.dateFormat ?? "DD/MM/YYYY";
  const dateFnsFormat = DATE_FORMAT_MAP[dateFormat] || "dd/MM/yyyy";

  // Convert value to Date object
  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    // Try to parse string value
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !dateValue && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateValue ? (
            format(dateValue, dateFnsFormat, { locale: es })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

// Controller-compatible version for react-hook-form
interface ControlledDatePickerProps extends Omit<
  DatePickerProps,
  "value" | "onChange"
> {
  field: {
    value: string | Date | undefined;
    onChange: (value: string) => void;
  };
}

export function ControlledDatePicker({
  field,
  ...props
}: ControlledDatePickerProps) {
  const handleChange = (date: Date | undefined) => {
    if (date) {
      // Return as YYYY-MM-DD string for form compatibility
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      field.onChange(`${year}-${month}-${day}`);
    } else {
      field.onChange("");
    }
  };

  // Parse the string value to Date for display
  const dateValue = React.useMemo(() => {
    if (!field.value) return undefined;
    if (field.value instanceof Date) return field.value;
    // Parse YYYY-MM-DD format
    const parsed = new Date(field.value + "T12:00:00");
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }, [field.value]);

  return <DatePicker {...props} value={dateValue} onChange={handleChange} />;
}
