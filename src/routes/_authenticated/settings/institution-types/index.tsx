import {
  useCreateInstitutionTypeMutation,
  useUpdateInstitutionTypeMutation,
} from "@/api/mutations/institution-types";
import type { InstitutionType, InstitutionTypeFormValues } from "@/types";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { InstitutionTypeFormModal } from "./-components/InstitutionTypeFormModal";
import { InstitutionTypesTable } from "./-components/InstitutionTypesTable";

export const Route = createFileRoute("/_authenticated/settings/institution-types/")({
  component: InstitutionTypesPage,
});

const emptyValues: InstitutionTypeFormValues = {
  name: "",
  description: "",
};

function InstitutionTypesPage() {
  const [editing, setEditing] = useState<InstitutionType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const createMutation = useCreateInstitutionTypeMutation();
  const updateMutation = useUpdateInstitutionTypeMutation();
  const saveMutation = editing ? updateMutation : createMutation;

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (institutionType: InstitutionType) => {
    setEditing(institutionType);
    setModalOpen(true);
  };

  const onSubmit = (values: InstitutionTypeFormValues) => {
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, data: values },
        { onSuccess: () => setModalOpen(false) },
      );
    } else {
      createMutation.mutate(values, { onSuccess: () => setModalOpen(false) });
    }
  };

  return (
    <>
      <InstitutionTypesTable onCreate={openCreate} onEdit={openEdit} />

      <InstitutionTypeFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Edit Institution Type" : "New Institution Type"}
        defaultValues={
          editing
            ? {
                name: editing.name,
                description: editing.description ?? "",
              }
            : emptyValues
        }
        onSubmit={onSubmit}
        isSaving={saveMutation.isPending}
      />
    </>
  );
}
