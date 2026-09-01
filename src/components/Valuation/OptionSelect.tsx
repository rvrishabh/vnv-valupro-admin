import FormDropdown from "@/components/Form/FormDropdown";
import type { ValuationOptions } from "@/types";
import type { Control, FieldValues, Path } from "react-hook-form";

/**
 * A react-hook-form field backed by one of the workbook's option groups.
 *
 * Groups are extracted from the master workbook's data validations, so the
 * choices offered here are exactly the ones the sheet offers — see
 * `scripts/extract-validations.ts` in the backend.
 */
export function OptionSelect<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  group,
  options,
  label,
  description,
  disabled,
  className,
  placeholder = "Select…",
  allowEmpty = true,
  parseValue,
  formatValue,
  onValueChange,
}: {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  group: string;
  options?: ValuationOptions;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  allowEmpty?: boolean;
  parseValue?: (value: string) => unknown;
  formatValue?: (value: unknown) => string;
  onValueChange?: (value: unknown, raw: string) => void;
}) {
  const choices = options?.[group] ?? [];

  return (
    <FormDropdown
      control={control}
      name={name}
      label={label}
      description={description}
      disabled={disabled}
      className={className}
      placeholder={placeholder}
      allowClear={allowEmpty}
      parseValue={parseValue}
      formatValue={formatValue}
      onValueChange={onValueChange}
      options={choices.map((choice) => ({ label: choice, value: choice }))}
    />
  );
}
