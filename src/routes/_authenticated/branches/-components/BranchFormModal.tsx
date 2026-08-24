import { useInstitutionsQuery } from "@/api/queries/institutions";
import FormComboBox from "@/components/Form/FormComboBox";
import FormInput from "@/components/Form/FormInput";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { branchFormSchema } from "@/schemas";
import type { BranchFormValues } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const emptyValues: BranchFormValues = {
  institutionId: "",
  branchName: "",
  city: "",
  state: "",
  district: "",
  address: "",
};

interface BranchFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: BranchFormValues) => void;
  isSaving: boolean;
}

export function BranchFormModal({
  open,
  onOpenChange,
  onSubmit,
  isSaving,
}: BranchFormModalProps) {
  const institutionsQuery = useInstitutionsQuery({ page: 1, limit: 200 });
  const institutionOptions = institutionsQuery.data?.data ?? [];

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    values: emptyValues,
  });

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New Branch">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-2 pb-2"
        >
          <FormComboBox
            control={form.control}
            name="institutionId"
            label="Institution"
            placeholder="Select an institution"
            required
            options={institutionOptions.map((inst) => ({
              label: inst.name,
              value: inst.id,
            }))}
          />
          <FormInput
            control={form.control}
            name="branchName"
            label="Branch Name"
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <FormInput control={form.control} name="city" label="City" required />
            <FormInput control={form.control} name="state" label="State" required />
          </div>
          <FormInput control={form.control} name="district" label="District" />
          <FormInput control={form.control} name="address" label="Address" />
          <Button type="submit" className="w-full mt-2" disabled={isSaving}>
            {isSaving ? "Creating…" : "Create Branch"}
          </Button>
        </form>
      </Form>
    </Modal>
  );
}
