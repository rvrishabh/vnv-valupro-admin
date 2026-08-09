import type { ClassValue } from "clsx";
import React from "react";


import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { TooltipHelper } from "../TooltipHelper";
import { cn } from "../../lib/utils";
import { Info } from "lucide-react";

type Option = { label: string | React.ReactNode; value: string };

interface Props {
  label?: string;
  options: Option[];
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  error?: string;
  className?: ClassValue;
  required?: boolean;
  tooltipContent?: React.ReactNode;
}

export const Dropdown = ({
  label,
  options,
  placeholder,
  value,
  onChange,
  error,
  disabled,
  className,
  required,
  tooltipContent,
}: Props) => (
  <div className="space-y-1">
    {label && (
      <div className="flex items-center gap-1">
        <Label
          className={cn(
            "block leading-9",
            required && "after:text-red-400 after:content-['*']"
          )}
        >
          {label}
        </Label>

        {tooltipContent && (
          <TooltipHelper
            trigger={<Info className="fill-muted-foreground" />}
          >
            {tooltipContent}
          </TooltipHelper>
        )}
      </div>
    )}
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          "min-w-[100px]",
          error && "ring-1 ring-red-400",
          className,
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            className="cursor-pointer"
            key={option.value}
            value={option.value}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {error && <p className="text-xs leading-4 text-red-500">{error}</p>}
  </div>
);
