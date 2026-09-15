import { useUpdateCaseMutation } from "@/api/mutations/cases";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { createCasePayloadSchema } from "@/schemas";
import type { Case, CreateCasePayload } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { CaseDetailsFields } from "./CaseDetailsFields";

interface EditCaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: Case;
}

/** Edits the case's own details — customer, bank, branch, property type/location, bank reference. Not a status change. */
export function EditCaseModal({ open, onOpenChange, record }: EditCaseModalProps) {
  const updateCase = useUpdateCaseMutation();

  const form = useForm<CreateCasePayload>({
    resolver: zodResolver(createCasePayloadSchema),
    values: {
      customerName: record.customerName,
      customerMobile: record.customerMobile,
      institutionId: record.institutionId,
      branchId: record.branchId ?? "",
      propertyType: record.propertyType,
      propertyLocation: record.propertyLocation ?? "",
      bankReference: record.bankReference ?? "",
    },
  });
  const institutionId = useWatch({ control: form.control, name: "institutionId" });

  const onSubmit = (values: CreateCasePayload) => {
    updateCase.mutate(
      {
        id: record.id,
        data: {
          customerName: values.customerName,
          customerMobile: values.customerMobile,
          institutionId: values.institutionId,
          branchId: values.branchId || undefined,
          propertyType: values.propertyType,
          propertyLocation: values.propertyLocation || undefined,
          bankReference: values.bankReference || undefined,
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Edit Case Details">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 pb-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <CaseDetailsFields control={form.control} institutionId={institutionId} />
          </div>
          <Button type="submit" className="w-full mt-2" disabled={updateCase.isPending}>
            {updateCase.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </form>
      </Form>
    </Modal>
  );
}
