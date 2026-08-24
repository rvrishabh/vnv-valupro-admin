import { useRolesQuery } from "@/api/queries/roles";
import FormComboBox from "@/components/Form/FormComboBox";
import FormInput from "@/components/Form/FormInput";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { userCreateFormSchema, userEditFormSchema } from "@/schemas";
import type { UserCreateFormValues, UserEditFormValues } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  createDefaultValues: UserCreateFormValues;
  editDefaultValues: UserEditFormValues;
  onCreateSubmit: (values: UserCreateFormValues) => void;
  onEditSubmit: (values: UserEditFormValues) => void;
  isSaving: boolean;
}

export function UserFormModal({
  open,
  onOpenChange,
  mode,
  createDefaultValues,
  editDefaultValues,
  onCreateSubmit,
  onEditSubmit,
  isSaving,
}: UserFormModalProps) {
  const rolesQuery = useRolesQuery({
    page: 1,
    limit: 100,
    loginChannel: "WEB",
  });
  const roleOptions = (rolesQuery.data?.data ?? []).map((role) => ({
    label: role.name,
    value: role.id,
  }));

  const createForm = useForm<UserCreateFormValues>({
    resolver: zodResolver(userCreateFormSchema),
    values: createDefaultValues,
  });
  const editForm = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditFormSchema),
    values: editDefaultValues,
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "edit" ? "Edit User" : "New Staff User"}
    >
      {mode === "edit" ? (
        <Form {...editForm}>
          <form
            onSubmit={editForm.handleSubmit(onEditSubmit)}
            className="space-y-2 pb-2"
          >
            <FormInput control={editForm.control} name="name" label="Name" required />
            <FormInput
              control={editForm.control}
              name="email"
              label="Email"
              disabled
            />
            <FormInput control={editForm.control} name="mobile" label="Mobile" />
            <Button type="submit" className="w-full mt-2" disabled={isSaving}>
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...createForm}>
          <form
            onSubmit={createForm.handleSubmit(onCreateSubmit)}
            className="space-y-2 pb-2"
          >
            <FormInput
              control={createForm.control}
              name="name"
              label="Name"
              required
            />
            <FormInput
              control={createForm.control}
              name="email"
              label="Email"
              type="email"
              required
            />
            <FormComboBox
              control={createForm.control}
              name="roleId"
              label="Role"
              placeholder="Select a role"
              required
              options={roleOptions}
            />
            <FormInput
              control={createForm.control}
              name="password"
              label="Password"
              isPassword
              required
              description="Min 8 chars, mixed case, number & symbol"
            />
            <FormInput control={createForm.control} name="mobile" label="Mobile" />
            <Button type="submit" className="w-full mt-2" disabled={isSaving}>
              {isSaving ? "Creating…" : "Create Staff User"}
            </Button>
          </form>
        </Form>
      )}
    </Modal>
  );
}
