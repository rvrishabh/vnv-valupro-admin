import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import * as React from "react";

import { type Control, type FieldValues } from "react-hook-form";
import { Button } from "./ui/button";
import { FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface MonthYearPickerProps {
  label: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  name: string;
  control: Control<FieldValues>;
  disabled?: boolean;
}

export function MonthYearPicker({
  label,
  name,
  control,
  disabled = false,
}: MonthYearPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [currentYear, setCurrentYear] = React.useState(
    new Date().getFullYear()
  );

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

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
                        month: "long",
                        year: "numeric",
                      })
                    : "Select month"}
                  <ChevronDownIcon />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent
              className="w-80 p-4"
              align="start"
              style={{ zIndex: 9999 }}
            >
              <div className="space-y-4">
                {/* Year Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentYear(currentYear - 1)}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold text-lg">{currentYear}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentYear(currentYear + 1)}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>

                {/* Months Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {months.map((month, index) => {
                    const isSelected =
                      field.value &&
                      field.value.getMonth() === index &&
                      field.value.getFullYear() === currentYear;

                    return (
                      <Button
                        key={month}
                        variant={isSelected ? "default" : "ghost"}
                        size="sm"
                        className="h-10 text-sm font-medium"
                        onClick={() => {
                          const newDate = new Date(currentYear, index, 1);
                          field.onChange(newDate);
                          setOpen(false);
                        }}
                      >
                        {month.slice(0, 3)}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </FormItem>
      )}
    />
  );
}
