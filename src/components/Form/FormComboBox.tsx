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
  FormDescription,
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
import { useState } from "react";
import { type Control, type FieldValues, type Path } from "react-hook-form";

interface FormComboBoxProps<TFieldValues extends FieldValues = FieldValues> {
  control?: Control<TFieldValues>;
  name?: Path<TFieldValues>;
  label?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  description?: string;
  required?: boolean;
  className?: string;
  error?: string; // Added error prop to display error messages
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const FormComboBox = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  options,
  placeholder = "Select an option",
  description,
  required = false,
  className,
  error, // Added error prop to the destructured props
  value,
  disabled = false,
  onChange,
}: FormComboBoxProps<TFieldValues>) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasLabel = label && label.trim() !== "";

  // Standalone mode
  if (!control || !name) {
    return (
      <div className={cn("flex flex-col", !hasLabel && "space-y-0", className)}>
        {hasLabel && (
          <label className="mb-1 font-medium">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-full justify-between h-10 px-2 rounded-lg text-primary",
                !value && "text-muted-foreground"
              )}
              onClick={() => setIsOpen(!isOpen)}
              disabled={disabled}
            >
              {value
                ? options.find((option) => option.value === value)?.label
                : placeholder}
              <ChevronsUpDown className="h-4 w-4  shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" style={{ zIndex: 9999 }}>
            <Command>
              <CommandInput
                placeholder={`Search ${
                  hasLabel ? label?.toLowerCase() : "options"
                }...`}
              />
              <CommandList>
                <CommandEmpty>No options found.</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      className="cursor-pointer"
                      value={option.value}
                      key={option.value}
                      onSelect={() => {
                        if (onChange) onChange(option.value);
                        setIsOpen(false);
                      }}
                    >
                      {option.label}
                      <Check
                        className={cn(
                          "ml-auto",
                          option.value === value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {description && (
          <div className="text-xs text-muted-foreground mt-1">
            {description}
          </div>
        )}
        {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
      </div>
    );
  }

  // react-hook-form mode
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem
          className={cn("flex flex-col", !hasLabel && "space-y-0", className)}
        >
          {hasLabel && (
            <FormLabel>
              {label} {required && <span className="text-red-500">*</span>}
            </FormLabel>
          )}
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between h-8 px-2 rounded-lg border-2 border-primary/10 bg-white text-primary shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                    !field.value && "text-muted-foreground"
                  )}
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {field.value
                    ? options.find((option) => option.value === field.value)
                        ?.label
                    : placeholder}
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" style={{ zIndex: 9999 }}>
              <Command>
                <CommandInput
                  placeholder={`Search ${
                    hasLabel ? label?.toLowerCase() : "options"
                  }...`}
                />
                <CommandList>
                  <CommandEmpty>No options found.</CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        className="cursor-pointer"
                        value={option.label}
                        key={option.value}
                        onSelect={() => {
                          field.onChange(option.value);
                          setIsOpen(false);
                        }}
                      >
                        {option.label}
                        <Check
                          className={cn(
                            "ml-auto",
                            option.value === field.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {description && <FormDescription>{description}</FormDescription>}
          {(error || fieldState.error?.message) && (
            <FormMessage>{error || fieldState.error?.message}</FormMessage>
          )}
        </FormItem>
      )}
    />
  );
};

export default FormComboBox;
