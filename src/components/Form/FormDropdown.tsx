import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";
import type { Control, FieldValues, Path } from "react-hook-form";

/**
 * Radix Select cannot hold an empty string as an item value, so a sentinel
 * stands in for "not set" and is translated back on the way out.
 */
const CLEAR = "__clear__";

export interface FormDropdownOption {
  label: string;
  value: string;
}

interface FormDropdownProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label?: string;
  options: readonly FormDropdownOption[];
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  labelClassName?: string;
  /** Offer a "Clear" entry once a value is set. */
  allowClear?: boolean;
  /**
   * Store something other than the raw string — e.g. a number for a field the
   * API types numerically. The pair is applied on the way out and in.
   */
  parseValue?: (value: string) => unknown;
  formatValue?: (value: unknown) => string;
  /**
   * Called after the field is updated, for the cases where one field seeds
   * another (a default cascading to its overrides, a mirrored column).
   */
  onValueChange?: (value: unknown, raw: string) => void;
}

const FormDropdown = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  options,
  placeholder = "Select…",
  description,
  required = false,
  disabled = false,
  className,
  triggerClassName,
  labelClassName,
  allowClear = true,
  parseValue,
  formatValue,
  onValueChange,
}: FormDropdownProps<TFieldValues>) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => {
      const current = formatValue
        ? formatValue(field.value)
        : field.value === undefined || field.value === null
          ? ""
          : String(field.value);

      return (
        <FormItem className={cn("flex min-w-0 flex-col gap-1.5", className)}>
          {label && (
            <FormLabel className={cn("text-xs text-muted-foreground", labelClassName)}>
              {label} {required && <span className="text-red-500">*</span>}
            </FormLabel>
          )}
          <div className="relative">
            <Select
              value={current || undefined}
              disabled={disabled}
              onValueChange={(next) => {
                const raw = next === CLEAR ? "" : next;
                const parsed = parseValue ? parseValue(raw) : raw;
                field.onChange(parsed);
                onValueChange?.(parsed, raw);
              }}
            >
              <FormControl>
                <SelectTrigger
                  className={cn(
                    "w-full",
                    allowClear && current && "pr-8",
                    triggerClassName,
                  )}
                >
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {allowClear && current ? (
                  <SelectItem value={CLEAR} className="text-muted-foreground">
                    Clear
                  </SelectItem>
                ) : null}
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
                {/* A saved value that has since been removed from the list must
                    still render, or editing an old record would silently drop it. */}
                {current && !options.some((option) => option.value === current) ? (
                  <SelectItem value={current}>{current}</SelectItem>
                ) : null}
              </SelectContent>
            </Select>
            {allowClear && current && !disabled ? (
              <button
                type="button"
                aria-label="Clear"
                className="absolute right-8 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
                onClick={(event) => {
                  event.stopPropagation();
                  const parsed = parseValue ? parseValue("") : "";
                  field.onChange(parsed);
                  onValueChange?.(parsed, "");
                }}
              >
                <XIcon className="size-3.5" />
              </button>
            ) : null}
          </div>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      );
    }}
  />
);

export default FormDropdown;
export { FormDropdown };
