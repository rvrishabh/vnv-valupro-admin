import { type ClassValue } from "clsx";
import type { ComponentPropsWithRef } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";

import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "../../lib/utils";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

interface FormCheckBoxProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<ComponentPropsWithRef<typeof Checkbox>, "name"> {
  /** Pass with `name` to bind the field to react-hook-form. */
  control?: Control<TFieldValues>;
  name?: Path<TFieldValues>;
  label?: string;
  error?: string;
  containerClassName?: ClassValue;
  labelClassName?: ClassValue;
  /** "left" keeps the two-column label/box layout; "right" reads as a list row. */
  labelPosition?: "left" | "right";
}

export const FormCheckBox = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  error,
  required,
  labelClassName,
  containerClassName,
  labelPosition = "left",
  ...props
}: FormCheckBoxProps<TFieldValues>) => {
  const containerClasses = cn(
    labelPosition === "left"
      ? "grid grid-cols-2 items-center gap-2 whitespace-nowrap"
      : "flex flex-row-reverse items-center justify-end gap-2",
    containerClassName,
  );

  const labelClasses = cn(
    labelPosition === "left" ? "leading-9 font-bold" : "text-sm font-normal",
    labelClassName,
    required && "after:text-red-400 after:content-['*']",
  );

  // react-hook-form mode
  if (control && name) {
    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem className={containerClasses}>
            {label && <FormLabel className={labelClasses}>{label}</FormLabel>}
            <Checkbox
              {...props}
              required={required}
              checked={!!field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
            />
            {error ? (
              <span className="col-span-2 text-[12px] text-red-700">{error}</span>
            ) : (
              <FormMessage className="col-span-2" />
            )}
          </FormItem>
        )}
      />
    );
  }

  // Standalone mode
  return (
    <div className={containerClasses}>
      {label && (
        <Label className={labelClasses} htmlFor={props?.id}>
          {label}
        </Label>
      )}
      <Checkbox required={required} {...props} />
      {error && <span className="col-span-2 text-[12px] text-red-700">{error}</span>}
    </div>
  );
};

export default FormCheckBox;
