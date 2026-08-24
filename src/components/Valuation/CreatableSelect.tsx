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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ValuationOptions } from "@/types";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import { useState } from "react";

/**
 * A dropdown that also accepts a value not in the list — the valuer meets
 * property types the workbook never enumerated, and blocking them would push
 * the work back into Excel.
 */
export function CreatableSelect({
  group,
  options,
  value,
  onChange,
  disabled,
  placeholder = "Select or type…",
}: {
  group: string;
  options?: ValuationOptions;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const choices = options?.[group] ?? [];
  const trimmed = query.trim();
  const isNew =
    trimmed.length > 0 &&
    !choices.some((c) => c.toLowerCase() === trimmed.toLowerCase());

  const commit = (next: string) => {
    onChange(next);
    setQuery("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
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
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
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
              {choices.map((choice) => (
                <CommandItem key={choice} value={choice} onSelect={() => commit(choice)}>
                  <IconCheck
                    className={cn(
                      "mr-2 size-4",
                      value === choice ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {choice}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
