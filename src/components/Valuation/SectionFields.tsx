import FormInput from "@/components/Form/FormInput";
import { FormTextArea } from "@/components/Form/FormTextArea";
import { Label } from "@/components/ui/label";
import type { ValuationOptions } from "@/types";
import type { Control, FieldValues, Path } from "react-hook-form";
import { CreatableSelect } from "./CreatableSelect";
import type { FieldDef } from "./field-groups";
import { OptionSelect } from "./OptionSelect";

/** Shared label styling for the valuation form's dense field grids. */
export const FIELD_LABEL_CLASS = "text-xs text-muted-foreground";

/**
 * Layout wrapper for a value the form only displays — a computed area, say.
 * Editable fields use the Form components, which render their own label.
 */
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label className={FIELD_LABEL_CLASS}>{label}</Label>
      {children}
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

/**
 * Renders a declarative field list against one section of the form. A field
 * with an option group becomes a dropdown, everything else a text input —
 * which is what keeps the form and the workbook's data validations in step.
 */
export function SectionFields<TFieldValues extends FieldValues = FieldValues>({
  control,
  section,
  fields,
  options,
  disabled,
}: {
  control: Control<TFieldValues>;
  /** Path of the form section these keys hang off, e.g. `"siteAddress"`. */
  section: string;
  fields: FieldDef[];
  options?: ValuationOptions;
  disabled?: boolean;
}) {
  return (
    <>
      {fields.map((field) => {
        const name = `${section}.${field.key}` as Path<TFieldValues>;

        if (field.group && field.creatable) {
          return (
            <CreatableSelect
              key={field.key}
              control={control}
              name={name}
              label={field.label}
              group={field.group}
              options={options}
              disabled={disabled}
              persist={field.persist}
            />
          );
        }

        if (field.group) {
          return (
            <OptionSelect
              key={field.key}
              control={control}
              name={name}
              label={field.label}
              group={field.group}
              options={options}
              disabled={disabled}
            />
          );
        }

        if (field.type === "textarea") {
          return (
            <FormTextArea
              key={field.key}
              control={control}
              name={name}
              label={field.label}
              labelClassName={FIELD_LABEL_CLASS}
              rows={2}
              className="field-sizing-fixed min-w-0"
              disabled={disabled}
            />
          );
        }

        return (
          <FormInput
            key={field.key}
            control={control}
            name={name}
            label={field.label}
            labelClassName={FIELD_LABEL_CLASS}
            type={field.type === "number" ? "number" : "text"}
            disabled={disabled}
          />
        );
      })}
    </>
  );
}
