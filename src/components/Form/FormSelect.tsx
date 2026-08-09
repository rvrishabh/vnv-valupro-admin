import type { Control, FieldValues, Path } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

interface FormSelectProps<TFieldValues extends FieldValues = FieldValues> {
  control?: Control<TFieldValues>; // Make optional
  name: Path<TFieldValues> | string;
  label: string;
  options: { label: string; value: string }[];
  required?: boolean;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const FormSelect = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  options,
  required = false,
  className,
  value,
  onChange,
  disabled = false,
}: FormSelectProps<TFieldValues>) => {
  const isControlled = !control;

  const buttons = (fieldValue: string, handleChange: (val: string) => void) =>
    options.map((option) => (
      <Button
        key={option.value}
        type="button"
        className={cn(
          "px-4 py-2 rounded border",
          fieldValue === option.value
            ? "bg-primary text-white"
            : "bg-white text-primary border-primary",
          "hover:bg-primary hover:text-white"
        )}
        onClick={() => handleChange(option.value)}
        disabled={disabled}
      >
        {option.label}
      </Button>
    ));

  if (isControlled) {
    return (
      <div className={cn("pb-4 w-full", className)}>
        <label className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex space-x-2 mt-1">
          {buttons(value ?? "", onChange!)}
        </div>
      </div>
    );
  }

  // react-hook-form mode
  return (
    <FormField
      control={control}
      name={name as Path<TFieldValues>}
      render={({ field }) => (
        <FormItem className={cn("pb-4 w-full", className)}>
          <FormLabel>
            {label} {required && <span className="text-red-500">*</span>}
          </FormLabel>
          <FormControl>
            <div className="flex space-x-2">
              {buttons(field.value, field.onChange)}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormSelect;
