import FormInput from "@/components/Form/FormInput";
import { FormTextArea } from "@/components/Form/FormTextArea";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { institutionTypeFormSchema } from "@/schemas";
import type { InstitutionTypeFormValues } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface InstitutionTypeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  defaultValues: InstitutionTypeFormValues;
  onSubmit: (values: InstitutionTypeFormValues) => void;
  isSaving: boolean;
}

export function InstitutionTypeFormModal({
  open,
  onOpenChange,
  title,
  defaultValues,
  onSubmit,
  isSaving,
}: InstitutionTypeFormModalProps) {
  const form = useForm<InstitutionTypeFormValues>({
    resolver: zodResolver(institutionTypeFormSchema),
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
          <FormTextArea
            control={form.control}
            name="description"
            label="Description"
            placeholder="Optional description"
          />
          <Button type="submit" className="w-full mt-2" disabled={isSaving}>
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </form>
      </Form>
    </Modal>
  );
}
