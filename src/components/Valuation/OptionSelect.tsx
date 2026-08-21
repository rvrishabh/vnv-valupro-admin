import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ValuationOptions } from "@/types";

/**
 * A dropdown backed by one of the workbook's option groups.
 *
 * Groups are extracted from the master workbook's data validations, so the
 * choices offered here are exactly the ones the sheet offers — see
 * `scripts/extract-validations.ts` in the backend.
 */
export function OptionSelect({
  group,
  options,
  value,
  onChange,
  disabled,
  placeholder = "Select…",
  allowEmpty = true,
}: {
  group: string;
  options?: ValuationOptions;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  allowEmpty?: boolean;
}) {
  const choices = options?.[group] ?? [];

  // Radix Select cannot hold an empty string as an item value, so a sentinel
  // stands in for "not set" and is translated back on the way out.
  const CLEAR = "__clear__";

  return (
    <Select
      value={value || undefined}
      disabled={disabled}
      onValueChange={(next) => onChange(next === CLEAR ? "" : next)}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowEmpty && value ? (
          <SelectItem value={CLEAR} className="text-muted-foreground">
            Clear
          </SelectItem>
        ) : null}
        {choices.map((choice) => (
          <SelectItem key={choice} value={choice}>
            {choice}
          </SelectItem>
        ))}
        {/* A saved value that has since been removed from the book must still
            render, or editing an old report would silently drop it. */}
        {value && !choices.includes(value) ? (
          <SelectItem value={value}>{value}</SelectItem>
        ) : null}
      </SelectContent>
    </Select>
  );
}
