import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import {
  type Control,
  type FieldValues,
  type Path,
  type PathValue,
  type UseFormReturn,
} from "react-hook-form";

interface Option {
  label: string;
  value: string;
}

interface FormCurrencyComboBoxProps<T extends FieldValues> {
  control?: Control<T>;
  methods: UseFormReturn<T>;
  name: Path<T>;
  label?: string;
  cryptoOptions?: Option[];
  fiatOptions?: Option[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export default function FormCurrencyComboBox<T extends FieldValues>({
  control,
  methods,
  name,
  label,
  cryptoOptions = [],
  fiatOptions = [],
  placeholder = "Select currency...",
  required,
  error,
  className,
  disabled,
}: FormCurrencyComboBoxProps<T>) {
  const [open, setOpen] = React.useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem className={cn("flex flex-col pb-4", className)}>
            {label && (
              <FormLabel>
                {label}
                {required && <span className="text-destructive">*</span>}
              </FormLabel>
            )}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground",
                      error && "border-destructive"
                    )}
                    disabled={disabled}
                  >
                    {field.value
                      ? [...(cryptoOptions || []), ...fiatOptions].find(
                          (option) => option.value === field.value
                        )?.label
                      : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent
                className="w-full p-0"
                align="start"
                style={{ zIndex: 9999 }}
              >
                <Command>
                  <CommandInput
                    placeholder={`Search ${label?.toLowerCase()}...`}
                    className="h-9"
                    disabled={disabled}
                  />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    {cryptoOptions?.length > 0 && (
                      <CommandGroup heading="Crypto Currencies">
                        {cryptoOptions?.map((option) => (
                          <CommandItem
                            className="cursor-pointer"
                            key={option.value}
                            value={option.label}
                            onSelect={() => {
                              methods.setValue(
                                name,
                                option.value as PathValue<T, Path<T>>
                              );
                              setOpen(false);
                            }}
                          >
                            {option.label}
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                field.value === option.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                    {fiatOptions?.length > 0 && (
                      <>
                        <div className="border-t my-1" />
                        <CommandGroup heading="Fiat Currencies">
                          {fiatOptions?.map((option) => (
                            <CommandItem
                              key={option.value}
                              value={option.label}
                              onSelect={() => {
                                methods.setValue(
                                  name,
                                  option.value as PathValue<T, Path<T>>
                                );
                                setOpen(false);
                              }}
                            >
                              {option.label}
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  field.value === option.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
