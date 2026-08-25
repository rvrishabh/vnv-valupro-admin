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
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import { useState } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";

interface FormCreatableSelectProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label?: string;
  options: readonly string[];
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
}

/**
 * A dropdown that also accepts a value not in the list — the list is a starting
 * point rather than an exhaustive one, and blocking anything else would push
 * the work back out of the app.
 */
const FormCreatableSelect = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  options,
  placeholder = "Select or type…",
  description,
  required = false,
  disabled = false,
  className,
  labelClassName,
}: FormCreatableSelectProps<TFieldValues>) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const trimmed = query.trim();
  const isNew =
    trimmed.length > 0 &&
    !options.some((option) => option.toLowerCase() === trimmed.toLowerCase());

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value =
          field.value === undefined || field.value === null ? "" : String(field.value);

        const commit = (next: string) => {
          field.onChange(next);
          setQuery("");
          setOpen(false);
        };

        return (
          <FormItem className={cn("flex min-w-0 flex-col gap-1.5", className)}>
            {label && (
              <FormLabel className={cn("text-xs text-muted-foreground", labelClassName)}>
                {label} {required && <span className="text-red-500">*</span>}
              </FormLabel>
            )}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                      "w-full justify-between font-normal",
                      !value && "text-muted-foreground",
                    )}
                  >
                    <span className="min-w-0 truncate">{value || placeholder}</span>
                    <IconChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
              >
                <Command>
                  <CommandInput
                    placeholder="Search or type a new value…"
                    value={query}
                    onValueChange={setQuery}
                  />
                  <CommandList>
                    {!isNew ? <CommandEmpty>No match.</CommandEmpty> : null}
                    {isNew ? (
                      <CommandGroup heading="Add new">
                        <CommandItem value={trimmed} onSelect={() => commit(trimmed)}>
                          Use “{trimmed}”
                        </CommandItem>
                      </CommandGroup>
                    ) : null}
                    <CommandGroup>
                      {options.map((option) => (
                        <CommandItem
                          key={option}
                          value={option}
                          onSelect={() => commit(option)}
                        >
                          <IconCheck
                            className={cn(
                              "mr-2 size-4",
                              value === option ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {option}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default FormCreatableSelect;
export { FormCreatableSelect };
