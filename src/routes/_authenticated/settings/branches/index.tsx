import { useCreateManualBranchMutation } from "@/api/mutations/branches";
import type { BranchFormValues } from "@/types";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BranchesTable } from "./-components/BranchesTable";
import { BranchFormModal } from "./-components/BranchFormModal";

export const Route = createFileRoute("/_authenticated/settings/branches/")({
  component: BranchesPage,
});

function BranchesPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const createMutation = useCreateManualBranchMutation();

  const onSubmit = (values: BranchFormValues) =>
    createMutation.mutate(values, { onSuccess: () => setModalOpen(false) });

  return (
    <>
      <BranchesTable onCreate={() => setModalOpen(true)} />

      <BranchFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={onSubmit}
        isSaving={createMutation.isPending}
      />
    </>
  );
}
