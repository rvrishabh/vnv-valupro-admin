import {
  useCreateInstitutionMutation,
  useUpdateInstitutionMutation,
} from "@/api/mutations/institutions";
import type { Institution, InstitutionFormValues } from "@/types";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { InstitutionFormModal } from "./-components/InstitutionFormModal";
import { InstitutionsTable } from "./-components/InstitutionsTable";

export const Route = createFileRoute("/_authenticated/settings/institutions/")({
  component: InstitutionsPage,
});

const emptyValues: InstitutionFormValues = {
  name: "",
  code: "",
  institutionTypeId: "",
};

function InstitutionsPage() {
  const [editing, setEditing] = useState<Institution | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const createMutation = useCreateInstitutionMutation();
  const updateMutation = useUpdateInstitutionMutation();
  const toggleActiveMutation = useUpdateInstitutionMutation();
  const saveMutation = editing ? updateMutation : createMutation;

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (institution: Institution) => {
    setEditing(institution);
    setModalOpen(true);
  };

  const toggleActive = (institution: Institution) =>
    toggleActiveMutation.mutate({
      id: institution.id,
      data: { isActive: !institution.isActive },
    });

  const onSubmit = (values: InstitutionFormValues) => {
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, data: values },
        {
          onSuccess: () => {
            toast.success("Institution updated");
            setModalOpen(false);
          },
        },
      );
    } else {
      createMutation.mutate(values, { onSuccess: () => setModalOpen(false) });
    }
  };

  return (
    <>
      <InstitutionsTable
        onCreate={openCreate}
        onEdit={openEdit}
        onToggleActive={toggleActive}
      />

      <InstitutionFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Edit Institution" : "New Institution"}
        defaultValues={
          editing
            ? {
                name: editing.name,
                code: editing.code,
                institutionTypeId: editing.institutionTypeId,
              }
            : emptyValues
        }
        onSubmit={onSubmit}
        isSaving={saveMutation.isPending}
      />
    </>
  );
}
