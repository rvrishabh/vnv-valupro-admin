import { Fragment } from "react";

import { cn } from "../../lib/utils";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";

type Option = {
  groupLabel: string;
  options: {
    label: string;
    value: string;
  }[];
};

interface Props {
  id?: string;
  label: string;
  placeholder: string;
  options: Option[];
  value: string;
  disabled?: boolean;
  required?: boolean;
  onChange: (value: string) => void;
  error?: string;
}

export const NestedDropdown = ({
  id,
  options,
  placeholder,
  label,
  value,
  disabled,
  onChange,
  required,
  error,
}: Props) => (
  <div className="space-y-1">
    <Label
      className={cn(
        " leading-9",
        required && "after:text-red-400 after:content-['*']"
      )}
    >
      {label}
    </Label>
    <Select
      disabled={disabled}
      value={value}
      onValueChange={(value) => {
        if (value && value?.length > 0) {
          onChange(value);
        }
      }}
    >
      <SelectTrigger
        id={id}
        className={cn(
          "min-w-[180px]",
          error && "ring-1 ring-red-400",
          disabled && "pointer-events-none opacity-40"
        )}
        aria-label="options"
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options?.map((option, index) => (
          <Fragment key={option?.groupLabel}>
            <SelectGroup>
              <SelectLabel className="text-xs font-normal text-muted-foreground">
                {option?.groupLabel}
              </SelectLabel>
              {option?.options?.map((item) => (
                <SelectItem key={item?.value} value={item?.value}>
                  {item?.label}
                </SelectItem>
              ))}
              {index !== options.length - 1 && (
                <Separator className="my-[5px] h-[1px] bg-muted" />
              )}
            </SelectGroup>
          </Fragment>
        ))}
      </SelectContent>
    </Select>

    {error && <p className="text-xs leading-4 text-red-400">{error}</p>}
  </div>
);
