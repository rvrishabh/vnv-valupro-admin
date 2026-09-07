import {
  useAssignPermissionsMutation,
  useUnassignPermissionMutation,
} from "@/api/mutations/roles";
import { usePermissionsQuery } from "@/api/queries/permissions";
import { useRoleQuery } from "@/api/queries/roles";
import { FormCheckBox } from "@/components/Form/FormCheckBox";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import type { Permission, RolePermissionsFormValues } from "@/types";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

interface ManagePermissionsModalProps {
  roleId: string | null;
  onClose: () => void;
}

export function ManagePermissionsModal({
  roleId,
  onClose,
}: ManagePermissionsModalProps) {
  const roleQuery = useRoleQuery(roleId ?? undefined);
  const permissionsQuery = usePermissionsQuery({ page: 1, limit: 100 });
  const assignMutation = useAssignPermissionsMutation();
  const unassignMutation = useUnassignPermissionMutation();

  const granted = useMemo(
    () => (roleQuery.data?.rolePermissions ?? []).map((rp) => rp.permission.id),
    [roleQuery.data],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const permission of permissionsQuery.data?.data ?? []) {
      const list = map.get(permission.resource) ?? [];
      list.push(permission);
      map.set(permission.resource, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [permissionsQuery.data]);

  // `values` re-seeds the form whenever the role's permissions arrive or
  // change, so the checkboxes follow the query without an effect.
  const form = useForm<RolePermissionsFormValues>({
    values: {
      permissions: Object.fromEntries(granted.map((id) => [id, true])),
    },
  });

  const isSaving = assignMutation.isPending || unassignMutation.isPending;
  const isAdmin = roleQuery.data?.name.toLowerCase() === "admin";

  const onSubmit = async (formValues: RolePermissionsFormValues) => {
    if (!roleId || isAdmin) return;

    const selected = Object.entries(formValues.permissions)
      .filter(([, checked]) => checked)
      .map(([id]) => id);
    const current = new Set(granted);

    const toAdd = selected.filter((id) => !current.has(id));
    const toRemove = granted.filter((id) => !selected.includes(id));

    if (toAdd.length > 0) {
      await assignMutation.mutateAsync({
        id: roleId,
        data: { permissionIds: toAdd },
      });
    }
    for (const permissionId of toRemove) {
      await unassignMutation.mutateAsync({ id: roleId, permissionId });
    }
    onClose();
  };

  return (
    <Modal
      open={!!roleId}
      onOpenChange={(open) => !open && onClose()}
      title={
        roleQuery.data ? `Permissions — ${roleQuery.data.name}` : "Permissions"
      }
      className="max-w-screen-sm"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pb-2">
            {isAdmin && (
              <p className="text-sm text-muted-foreground">
                The Admin role's permissions cannot be changed.
              </p>
            )}
            {grouped.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No permissions have been created yet.
              </p>
            ) : (
              grouped.map(([resource, permissions]) => (
                <div key={resource} className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    {resource}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {permissions.map((permission) => (
                      <FormCheckBox
                        key={permission.id}
                        control={form.control}
                        name={`permissions.${permission.id}`}
                        label={permission.action}
                        labelPosition="right"
                        disabled={isAdmin}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          <Button
            type="submit"
            className="w-full mt-2"
            disabled={isSaving || !roleId || isAdmin}
          >
            {isSaving ? "Saving…" : "Save Permissions"}
          </Button>
        </form>
      </Form>
    </Modal>
  );
}
