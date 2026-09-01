import {
  formatNumberWithCommas,
  unFormatNumber,
} from "@/utils/format-number.utils";
import { Info } from "lucide-react";
import React from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { cn } from "../../lib/utils";
import { TooltipHelper } from "../TooltipHelper";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { LabelInputContainer } from "./FormInput";

interface FormNumberInputProps<TFieldValues extends FieldValues = FieldValues> {
  control?: Control<TFieldValues>;
  name?: Path<TFieldValues>;
  label?: string;
  placeholder?: string;
  prefix?: string;
  required?: boolean;
  className?: string;
  error?: string;
  tooltipContent?: React.ReactNode;
  disabled?: boolean;
  labelClassName?: string;
  /** Small helper line under the field. */
  hint?: string;
  // For uncontrolled usage
  value?: string | number;
  onChange?: (value: string | number) => void;
  max?: number;
}

const FormNumberInput = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  placeholder,
  prefix,
  required = false,
  className,
  error,
  tooltipContent,
  disabled = false,
  labelClassName,
  hint,
  value,
  onChange,
  max,
  ...props
}: FormNumberInputProps<TFieldValues>) => {
  // If control and name are provided, use react-hook-form mode
  if (control && name) {
    return (
      <FormField
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <FormItem className={cn("w-full pb-4", className)}>
            {label && (
              <FormLabel className={labelClassName}>
                {label} {required && <span className="text-red-500">*</span>}
                {tooltipContent && (
                  <TooltipHelper
                    trigger={
                      <Info className="ml-1 w-4 h-4 inline fill-muted-foreground" />
                    }
                  >
                    {tooltipContent}
                  </TooltipHelper>
                )}
              </FormLabel>
            )}
            <FormControl>
              <LabelInputContainer>
                <div className="relative">
                  {prefix && (
                    <div
                      className={cn(
                        "inline-flex appearance-none items-center justify-center rounded-[4px] rounded-r-none border border-r-0 border-border bg-muted px-[15px] text-[15px] leading-none",
                        (error || fieldState.error) && "ring-1 ring-red-400"
                      )}
                    >
                      {prefix}
                    </div>
                  )}
                  <Input
                    {...field}
                    max={max}
                    value={formatNumberWithCommas(field.value || "")}
                    onChange={(e) => {
                      const rawValue = unFormatNumber(e.target.value);
                      // Only allow numbers and decimal points
                      if (/^\d*\.?\d*$/.test(rawValue)) {
                        field.onChange(rawValue);
                      }
                    }}
                    onBlur={(e) => {
                      // Ensure the field value is properly formatted on blur
                      const rawValue = unFormatNumber(e.target.value);
                      if (rawValue && /^\d*\.?\d*$/.test(rawValue)) {
                        field.onChange(rawValue);
                      }
                    }}
                    type="text" // Use text to allow commas display
                    inputMode="numeric"
                    className={cn(
                      "w-full",
                      prefix && "rounded-l-none rounded-r-[4px]",
                      (error || fieldState.error) && "ring-1 ring-red-400",
                      className
                    )}
                    placeholder={placeholder}
                    disabled={disabled}
                  />
                </div>
              </LabelInputContainer>
            </FormControl>
            {hint && (
              <span className="text-xs text-muted-foreground">{hint}</span>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  // Uncontrolled fallback (for backward compatibility)
  return (
    <div className="flex w-full flex-col flex-wrap items-start gap-1">
      {label && (
        <div className="flex items-center">
          <label
            className={cn(
              "leading-9",
              required && "after:text-red-400 after:content-['*']"
            )}
          >
            {label}
          </label>
          {tooltipContent && (
            <TooltipHelper trigger={<Info className="fill-muted-foreground" />}>
              {tooltipContent}
            </TooltipHelper>
          )}
        </div>
      )}
      <LabelInputContainer className="w-full">
        <div className="relative">
          {prefix && (
            <div
              className={cn(
                "inline-flex appearance-none items-center justify-center rounded-[4px] rounded-r-none border border-r-0 border-border bg-muted px-[15px] text-[15px] leading-none",
                error && "ring-1 ring-red-400"
              )}
            >
              {prefix}
            </div>
          )}
          <Input
            type="text"
            inputMode="numeric"
            value={formatNumberWithCommas(value?.toString() || "")}
            onChange={(e) => {
              const rawValue = unFormatNumber(e.target.value);
              // Only allow numbers and decimal points
              if (/^\d*\.?\d*$/.test(rawValue)) {
                onChange?.(rawValue);
              }
            }}
            onBlur={(e) => {
              // Ensure the field value is properly formatted on blur
              const rawValue = unFormatNumber(e.target.value);
              if (rawValue && /^\d*\.?\d*$/.test(rawValue)) {
                onChange?.(rawValue);
              }
            }}
            className={cn(
              "w-full",
              prefix && "rounded-l-none rounded-r-[4px]",
              error && "ring-1 ring-red-400",
              className
            )}
            placeholder={placeholder}
            disabled={disabled}
            {...props}
          />
        </div>
      </LabelInputContainer>
      {error && <span className="text-[12px] text-red-700">{error}</span>}
    </div>
  );
};

export { FormNumberInput };
