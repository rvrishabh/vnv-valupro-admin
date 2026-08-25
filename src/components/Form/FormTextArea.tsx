import { type ComponentPropsWithRef, type ReactNode } from "react";

import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { TooltipHelper } from "../TooltipHelper";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface FormTextAreaProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<ComponentPropsWithRef<typeof Textarea>, "name"> {
  /** Pass with `name` to bind the field to react-hook-form. */
  control?: Control<TFieldValues>;
  name?: Path<TFieldValues>;
  label?: string;
  error?: string;
  tooltipContent?: ReactNode;
  labelClassName?: string;
  containerClassName?: string;
}

function TextAreaLabel({
  label,
  required,
  htmlFor,
  tooltipContent,
  className,
}: {
  label: string;
  required?: boolean;
  htmlFor?: string;
  tooltipContent?: ReactNode;
  className?: string;
}) {
  return (
    <div className="flex items-center">
      <Label
        className={cn("leading-9", required && "after:text-red-400 after:content-['*']", className)}
        htmlFor={htmlFor}
      >
        {label}{" "}
      </Label>
      {tooltipContent && (
        <TooltipHelper trigger={<Info className="mx-1 fill-muted-foreground" />}>
          {tooltipContent}
        </TooltipHelper>
      )}
    </div>
  );
}

export const FormTextArea = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  className,
  error,
  tooltipContent,
  labelClassName,
  containerClassName,
  ...props
}: FormTextAreaProps<TFieldValues>) => {
  const containerClasses = cn(
    "flex w-full flex-col flex-wrap items-start gap-1",
    containerClassName,
  );

  // react-hook-form mode
  if (control && name) {
    return (
      <FormField
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <FormItem className={containerClasses}>
            {label && (
              <div className="flex items-center">
                <FormLabel
                  className={cn(
                    "leading-9",
                    props.required && "after:text-red-400 after:content-['*']",
                    labelClassName,
                  )}
                >
                  {label}{" "}
                </FormLabel>
                {tooltipContent && (
                  <TooltipHelper
                    trigger={<Info className="mx-1 fill-muted-foreground" />}
                  >
                    {tooltipContent}
                  </TooltipHelper>
                )}
              </div>
            )}
            <Textarea
              {...props}
              {...field}
              value={field.value ?? ""}
              className={cn((error || fieldState.error) && "ring-1 ring-red-400", className)}
            />
            {error ? (
              <span className="text-[12px] text-red-700">{error}</span>
            ) : (
              <FormMessage />
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
        <TextAreaLabel
          label={label}
          required={props.required}
          htmlFor={props.id}
          tooltipContent={tooltipContent}
          className={labelClassName}
        />
      )}
      <div className="flex w-full">
        <Textarea className={cn(error && "ring-1 ring-red-400", className)} {...props} />
      </div>
      {error && <span className="text-[12px] text-red-700">{error}</span>}
    </div>
  );
};

export default FormTextArea;
