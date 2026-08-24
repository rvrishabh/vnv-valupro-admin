import FormInput from "@/components/Form/FormInput";
import FormSelect from "@/components/Form/FormSelect";
import { FormTextArea } from "@/components/Form/FormTextArea";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { roleFormSchema } from "@/schemas";
import type { RoleFormValues } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface RoleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  defaultValues: RoleFormValues;
  onSubmit: (values: RoleFormValues) => void;
  isSaving: boolean;
}

export function RoleFormModal({
  open,
  onOpenChange,
  title,
  defaultValues,
  onSubmit,
  isSaving,
}: RoleFormModalProps) {
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
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
          <FormSelect
            control={form.control}
            name="loginChannel"
            label="Login Channel"
            options={[
              { label: "WEB", value: "WEB" },
              { label: "MOBILE", value: "MOBILE" },
            ]}
          />
          <FormTextArea
            {...form.register("description")}
            label="Description"
            placeholder="Optional description"
            error={form.formState.errors.description?.message}
          />
          <Button type="submit" className="w-full mt-2" disabled={isSaving}>
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </form>
      </Form>
    </Modal>
  );
}
