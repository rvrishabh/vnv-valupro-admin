import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "@/api/mutations/users";
import type {
  User,
  UserCreateFormValues,
  UserEditFormValues,
} from "@/types";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UserFormModal } from "./-components/UserFormModal";
import { UsersTable } from "./-components/UsersTable";

export const Route = createFileRoute("/_authenticated/users/")({
  component: UsersPage,
});

const emptyCreateValues: UserCreateFormValues = {
  name: "",
  email: "",
  roleId: "",
  password: "",
  mobile: "",
};

function UsersPage() {
  const [editing, setEditing] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setModalOpen(true);
  };

  const onCreateSubmit = (values: UserCreateFormValues) =>
    createMutation.mutate(
      {
        name: values.name,
        email: values.email,
        roleId: values.roleId,
        password: values.password,
        mobile: values.mobile || undefined,
      },
      { onSuccess: () => setModalOpen(false) },
    );

  const onEditSubmit = (values: UserEditFormValues) =>
    updateMutation.mutate(
      {
        id: editing!.id,
        data: { name: values.name, mobile: values.mobile || undefined },
      },
      { onSuccess: () => setModalOpen(false) },
    );

  return (
    <>
      <UsersTable onCreate={openCreate} onEdit={openEdit} />

      <UserFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={editing ? "edit" : "create"}
        createDefaultValues={emptyCreateValues}
        editDefaultValues={{
          name: editing?.name ?? "",
          email: editing?.email ?? "",
          mobile: editing?.mobile ?? "",
        }}
        onCreateSubmit={onCreateSubmit}
        onEditSubmit={onEditSubmit}
        isSaving={editing ? updateMutation.isPending : createMutation.isPending}
      />
    </>
  );
}
