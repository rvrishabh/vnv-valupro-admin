import FormCheckBox from "@/components/Form/FormCheckBox";
import FormDropdown from "@/components/Form/FormDropdown";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { tehsilUpliftFormSchema } from "@/schemas";
import type { UpsertTehsilUpliftPayload } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { UpliftPercentSelector } from "./UpliftPercentSelector";

type FormValues = z.infer<typeof tehsilUpliftFormSchema>;

interface TehsilUpliftFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  defaultValues: FormValues;
  /** Locked once a row is being edited — tehsil + position together are the key, not something to rename mid-edit. */
  keyFieldsLocked: boolean;
  tehsilOptions: string[];
  plotPositionOptions: string[];
  onSubmit: (values: UpsertTehsilUpliftPayload) => void;
  isSaving: boolean;
}

export function TehsilUpliftFormModal({
  open,
  onOpenChange,
  title,
  defaultValues,
  keyFieldsLocked,
  tehsilOptions,
  plotPositionOptions,
  onSubmit,
  isSaving,
}: TehsilUpliftFormModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(tehsilUpliftFormSchema),
    values: defaultValues,
  });

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-3 pb-2"
        >
          <FormDropdown
            control={form.control}
            name="tehsil"
            label="Tehsil"
            options={tehsilOptions.map((t) => ({ label: t, value: t }))}
            placeholder="Select a tehsil"
            disabled={keyFieldsLocked}
            required
          />
          <FormDropdown
            control={form.control}
            name="plotPosition"
            label="Plot position"
            description="The same options offered on the valuation form — the override applies only to this one position in this tehsil."
            options={plotPositionOptions.map((p) => ({ label: p, value: p }))}
            placeholder="Select a plot position"
            disabled={keyFieldsLocked}
            required
          />
          <UpliftPercentSelector control={form.control} name="upliftPercent" />
          <FormCheckBox
            control={form.control}
            name="isActive"
            label="Active"
            labelPosition="right"
          />
          <Button type="submit" className="w-full mt-2" disabled={isSaving}>
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </form>
      </Form>
    </Modal>
  );
}
