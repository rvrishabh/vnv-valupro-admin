import { useInstitutionTypesQuery } from "@/api/queries/institution-types";
import FormComboBox from "@/components/Form/FormComboBox";
import FormInput from "@/components/Form/FormInput";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { institutionFormSchema } from "@/schemas";
import type { InstitutionFormValues } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface InstitutionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  defaultValues: InstitutionFormValues;
  onSubmit: (values: InstitutionFormValues) => void;
  isSaving: boolean;
}

export function InstitutionFormModal({
  open,
  onOpenChange,
  title,
  defaultValues,
  onSubmit,
  isSaving,
}: InstitutionFormModalProps) {
  const typesQuery = useInstitutionTypesQuery({ page: 1, limit: 100 });
  const typeOptions = typesQuery.data ?? [];

  const form = useForm<InstitutionFormValues>({
    resolver: zodResolver(institutionFormSchema),
    values: defaultValues,
  });

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-2 pb-2"
        >
          <FormInput control={form.control} name="name" label="Name" required />
          <FormInput control={form.control} name="code" label="Code" required />
          <FormComboBox
            control={form.control}
            name="institutionTypeId"
            label="Institution Type"
            placeholder="Select a type"
            required
            options={typeOptions.map((type) => ({
              label: type.name,
              value: type.id,
            }))}
          />
          <Button type="submit" className="w-full mt-2" disabled={isSaving}>
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </form>
      </Form>
    </Modal>
  );
}
