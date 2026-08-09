import { type ClassValue } from "clsx";
import { forwardRef } from "react";

import { cn } from "../../lib/utils";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

interface FormCheckBoxProps
  extends React.ComponentPropsWithoutRef<typeof Checkbox> {
  label?: string;
  error?: string;
  required?: boolean;
  containerClassName?: ClassValue;
  labelClassName?: ClassValue;
}

export const FormCheckBox = forwardRef<
  React.ElementRef<typeof Checkbox>,
  FormCheckBoxProps
>(
  (
    { label, error, required, labelClassName, containerClassName, ...props },
    ref
  ) => {
    return (
      <div
        className={cn(
          "grid grid-cols-2 items-center gap-2 whitespace-nowrap",
          containerClassName
        )}
      >
        {label && (
          <Label
            className={cn(
              "leading-9 font-bold",
              labelClassName,
              required && "after:text-red-400 after:content-['*']"
            )}
            htmlFor={props?.id}
          >
            {label}
          </Label>
        )}
        <Checkbox ref={ref} {...props} />
        {error && (
          <span className="col-span-2 text-[12px] text-red-700">{error}</span>
        )}
      </div>
    );
  }
);
