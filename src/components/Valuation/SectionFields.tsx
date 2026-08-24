import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ValuationOptions } from "@/types";
import { CreatableSelect } from "./CreatableSelect";
import type { FieldDef } from "./field-groups";
import { OptionSelect } from "./OptionSelect";

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
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

/**
 * Renders a declarative field list against a plain record. A field with an
 * option group becomes a dropdown, everything else a text input — which is what
 * keeps the form and the workbook's data validations in step.
 */
export function SectionFields({
  fields,
  values,
  options,
  disabled,
  onChange,
}: {
  fields: FieldDef[];
  values: Record<string, unknown>;
  options?: ValuationOptions;
  disabled?: boolean;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <>
      {fields.map((field) => {
        const value = values?.[field.key] === undefined ? "" : String(values[field.key]);

        return (
          <Field
            key={field.key}
            label={field.label}
            hint={field.type === "textarea" ? undefined : undefined}
          >
            {field.group && field.creatable ? (
              <CreatableSelect
                group={field.group}
                options={options}
                value={value}
                disabled={disabled}
                onChange={(v) => onChange(field.key, v)}
              />
            ) : field.group ? (
              <OptionSelect
                group={field.group}
                options={options}
                value={value}
                disabled={disabled}
                onChange={(v) => onChange(field.key, v)}
              />
            ) : field.type === "textarea" ? (
              <Textarea
                rows={2}
                className="field-sizing-fixed min-w-0"
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(field.key, e.target.value)}
              />
            ) : (
              <Input
                type={field.type === "number" ? "number" : "text"}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(field.key, e.target.value)}
              />
            )}
          </Field>
        );
      })}
    </>
  );
}
