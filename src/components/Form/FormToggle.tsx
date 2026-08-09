import * as SwitchPrimitives from "@radix-ui/react-switch";
import React, { forwardRef } from "react";

import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

interface FormToggleProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  label?: string;
  error?: string;
}

export const FormToggle = forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  FormToggleProps
>(({ label, className, error, ...props }, ref) => {
  return (
    <div className="flex flex-col flex-wrap items-start gap-1">
      {/* LABEL */}
      {label && (
        <Label
          className={cn(
            "leading-9",
            props.required && "after:text-primary after:content-['*']"
          )}
          htmlFor={props?.id}
        >
          {label}{" "}
        </Label>
      )}
      {/* INPUT WITH OPTIONAL PREFIX */}
      <div className="flex w-full">
        <Switch
          ref={ref}
          className={cn(error && "ring-1 ring-primary", className)}
          {...props}
        />
      </div>
      {/* ERROR */}
      {error && <span className="text-[12px] text-red-700">{error}</span>}
    </div>
  );
});
