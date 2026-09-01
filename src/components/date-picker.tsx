import { ChevronDownIcon, XIcon } from "lucide-react";
import * as React from "react";
import { type Control, type FieldValues } from "react-hook-form";

import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface DatePickerProps {
  label: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  name: string;
  control: Control<FieldValues>;
  disabled?: boolean;
  disabledDate?: (date: Date) => boolean;
  defaultMonth?: Date;
}

export function DatePicker({
  label,
  name,
  control,
  disabled = false,
  disabledDate,
  defaultMonth,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col gap-3 w-full pb-4">
          <FormLabel>{label}</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className="w-full justify-between font-normal"
                  disabled={disabled}
                >
                  {field.value
                    ? field.value.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "Select date"}
                  <span className="flex items-center gap-1">
                    {field.value ? (
                      <XIcon
                        role="button"
                        aria-label="Clear"
                        className="size-4 opacity-50 hover:opacity-100"
                        onClick={(event) => {
                          event.stopPropagation();
                          field.onChange(undefined);
                          setOpen(false);
                        }}
                      />
                    ) : null}
                    <ChevronDownIcon />
                  </span>
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent
              className="w-full p-0"
              align="start"
              style={{ zIndex: 9999 }}
            >
              <Calendar
                mode="single"
                selected={field.value}
                defaultMonth={defaultMonth}
                captionLayout="dropdown"
                onSelect={(date) => {
                  field.onChange(date);
                  setOpen(false);
                }}
                disabled={disabledDate}
              />
            </PopoverContent>
          </Popover>
        </FormItem>
      )}
    />
  );
}
