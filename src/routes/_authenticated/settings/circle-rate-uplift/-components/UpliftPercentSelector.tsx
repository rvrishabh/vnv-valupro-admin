import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { UPLIFT_PERCENT_OPTIONS } from "@/types";
import type { Control, FieldValues, Path } from "react-hook-form";

interface UpliftPercentSelectorProps<
  TFieldValues extends FieldValues = FieldValues,
> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label?: string;
}

/** A fixed set of bands, not a free-form figure — see Settings > Circle Rate Uplift. */
export function UpliftPercentSelector<
  TFieldValues extends FieldValues = FieldValues,
>({ control, name, label = "Uplift percentage" }: UpliftPercentSelectorProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="flex gap-2">
              {UPLIFT_PERCENT_OPTIONS.map((option) => {
                const selected = field.value === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => field.onChange(option)}
                    className={cn(
                      "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background text-muted-foreground hover:bg-muted",
                    )}
                  >
                    +{option}%
                  </button>
                );
              })}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
