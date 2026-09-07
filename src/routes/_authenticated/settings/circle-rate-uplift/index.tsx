import { useUpsertTehsilUpliftMutation } from "@/api/mutations/circle-rate-uplift";
import { useValuationOptionsQuery } from "@/api/queries/valuations";
import type { TehsilCircleRateUplift, UpsertTehsilUpliftPayload } from "@/types";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TehsilUpliftFormModal } from "./-components/TehsilUpliftFormModal";
import { TehsilUpliftTable } from "./-components/TehsilUpliftTable";

export const Route = createFileRoute(
  "/_authenticated/settings/circle-rate-uplift/",
)({
  component: CircleRateUpliftPage,
});

const emptyValues = {
  tehsil: "",
  plotPosition: "",
  upliftPercent: 10 as const,
  isActive: true,
};

function CircleRateUpliftPage() {
  const [editing, setEditing] = useState<TehsilCircleRateUplift | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const optionsQuery = useValuationOptionsQuery();
  const upsertMutation = useUpsertTehsilUpliftMutation();

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row: TehsilCircleRateUplift) => {
    setEditing(row);
    setModalOpen(true);
  };

  const onSubmit = (values: UpsertTehsilUpliftPayload) => {
    upsertMutation.mutate(values, { onSuccess: () => setModalOpen(false) });
  };

  return (
    <>
      <TehsilUpliftTable onCreate={openCreate} onEdit={openEdit} />

      <TehsilUpliftFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Edit Uplift Override" : "New Uplift Override"}
        defaultValues={
          editing
            ? {
                tehsil: editing.tehsil,
                plotPosition: editing.plotPosition,
                upliftPercent: Number(editing.upliftPercent) as
                  | 10
                  | 20
                  | 30
                  | 40,
                isActive: editing.isActive,
              }
            : emptyValues
        }
        keyFieldsLocked={!!editing}
        tehsilOptions={optionsQuery.data?.tehsil ?? []}
        plotPositionOptions={optionsQuery.data?.plotPosition ?? []}
        onSubmit={onSubmit}
        isSaving={upsertMutation.isPending}
      />
    </>
  );
}
