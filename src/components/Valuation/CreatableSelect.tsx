import { useAddValuationOptionMutation } from "@/api/mutations/valuations";
import FormCreatableSelect from "@/components/Form/FormCreatableSelect";
import type { ValuationOptions } from "@/types";
import type { Control, FieldValues, Path } from "react-hook-form";

/**
 * A react-hook-form field offering one of the workbook's option groups, which
 * also accepts a value not in the list — the valuer meets property types the
 * workbook never enumerated, and blocking them would push the work back into
 * Excel.
 */
export function CreatableSelect<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  group,
  options,
  label,
  description,
  disabled,
  className,
  placeholder = "Select or type…",
  persist = false,
}: {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  group: string;
  options?: ValuationOptions;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  /**
   * Save a typed value back to the group so later reports offer it. Only for
   * open-ended registers such as tehsils; the backend rejects any other group.
   */
  persist?: boolean;
}) {
  const addOption = useAddValuationOptionMutation();

  return (
    <FormCreatableSelect
      control={control}
      name={name}
      label={label}
      description={description}
      disabled={disabled}
      className={className}
      placeholder={placeholder}
      options={options?.[group] ?? []}
      onCreate={
        persist ? (value) => addOption.mutate({ group, value }) : undefined
      }
    />
  );
}
