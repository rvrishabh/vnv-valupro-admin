import { CheckIcon, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Label } from "../ui/label";
import { cn } from "../../lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";

type Option = {
  id?: string;
  value: string;
  label: string;
};

interface DropdownAddressProps {
  options: Option[];
  value?: Option["value"];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  error?: string;
  isLoading?: boolean;
  required?: boolean;
  onChange: (options: Option) => void;
  triggerClassName?: string;
}

export function DropdownAddress({
  options,
  value,
  placeholder,
  onChange,
  label,
  disabled,
  required,
  triggerClassName,
}: DropdownAddressProps) {
  const [open, setOpen] = React.useState(false);
  const activeOption = options?.find((option) => option?.value === value);
  return (
    <div className="flex flex-col flex-wrap items-start w-full gap-1">
      {label && (
        <div className="flex items-center gap-1">
          <Label
            className={cn(
              "leading-9",
              required && "after:text-red-400 after:content-['*']"
            )}
            // htmlFor={}
          >
            {label}
          </Label>
          {/* {tooltipContent && (
            <TooltipHelper
              trigger={
                <AiOutlineInfoCircle className="fill-muted-foreground" />
              }
            >
              {tooltipContent}
            </TooltipHelper>
          )} */}
        </div>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger disabled={disabled} asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-[200px] justify-between", triggerClassName)}
          >
            {activeOption?.label ?? placeholder ?? "Select option..."}
            <ChevronsUpDown className="w-4 h-4 mx-0 ml-2 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder={placeholder ?? "Search options..."} />
            <CommandEmpty>No {label} found.</CommandEmpty>
            <CommandGroup
              heading="Options"
              className="max-h-[200px] overflow-y-scroll"
            >
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                >
                  {option.label}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      option.value === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
