import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
} from "@/api/mutations/roles";
import type { Role, RoleFormValues } from "@/types";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ManagePermissionsModal } from "./-components/ManagePermissionsModal";
import { RoleFormModal } from "./-components/RoleFormModal";
import { RolesTable } from "./-components/RolesTable";

export const Route = createFileRoute("/_authenticated/roles/")({
  component: RolesPage,
});

const emptyValues: RoleFormValues = {
  name: "",
  description: "",
  loginChannel: "WEB",
};

function RolesPage() {
  const [editing, setEditing] = useState<Role | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [permissionsRoleId, setPermissionsRoleId] = useState<string | null>(
    null,
  );

  const createMutation = useCreateRoleMutation();
  const updateMutation = useUpdateRoleMutation();
  const saveMutation = editing ? updateMutation : createMutation;

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditing(role);
    setModalOpen(true);
  };

  const onSubmit = (values: RoleFormValues) => {
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
      <RolesTable
        onCreate={openCreate}
        onEdit={openEdit}
        onManagePermissions={setPermissionsRoleId}
      />

      <RoleFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Edit Role" : "New Role"}
        defaultValues={
          editing
            ? {
                name: editing.name,
                description: editing.description ?? "",
                loginChannel: editing.loginChannel,
              }
            : emptyValues
        }
        onSubmit={onSubmit}
        isSaving={saveMutation.isPending}
      />

      <ManagePermissionsModal
        roleId={permissionsRoleId}
        onClose={() => setPermissionsRoleId(null)}
      />
    </>
  );
}
