import { forwardRef } from "react";

import { RadioGroup } from "@radix-ui/react-dropdown-menu";
import { Label } from "../ui/label";

import { cn } from "@/lib/utils";
import { RadioGroupItem } from "../ui/radio-group";

type Option = {
  label: string;
  value: string;
};

interface FormRadioGroupProps extends React.ComponentProps<typeof RadioGroup> {
  options: readonly Option[];
  label?: string;
  labelClassName?: string;
  required?: boolean;
}

export const FormRadioGroup = forwardRef<
  React.ElementRef<typeof RadioGroup>,
  FormRadioGroupProps
>(({ options, labelClassName, label, required, ...props }, ref) => (
  <div className="flex flex-col flex-wrap items-start w-full gap-1">
    {/* LABEL */}
    {label && (
      <Label
        className={cn(
          " leading-9 ",
          labelClassName,
          required && "after:text-red-400 after:content-['*']"
        )}
        htmlFor={props?.id}
      >
        {label}{" "}
      </Label>
    )}
    <RadioGroup ref={ref} aria-label="radio group" {...props}>
      {options?.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <RadioGroupItem value={option?.value} id={option?.value} />
          <Label htmlFor={option?.value}>{option?.label}</Label>
        </div>
      ))}
    </RadioGroup>
  </div>
));
