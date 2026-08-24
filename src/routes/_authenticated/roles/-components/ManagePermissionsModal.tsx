import {
  useAssignPermissionsMutation,
  useUnassignPermissionMutation,
} from "@/api/mutations/roles";
import { usePermissionsQuery } from "@/api/queries/permissions";
import { useRoleQuery } from "@/api/queries/roles";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Permission } from "@/types";
import { useEffect, useMemo, useState } from "react";

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

  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (roleQuery.data) {
      setSelected(
        new Set(
          (roleQuery.data.rolePermissions ?? []).map((rp) => rp.permission.id),
        ),
      );
    }
  }, [roleQuery.data]);

  const grouped = useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const permission of permissionsQuery.data?.data ?? []) {
      const list = map.get(permission.resource) ?? [];
      list.push(permission);
      map.set(permission.resource, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [permissionsQuery.data]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isSaving = assignMutation.isPending || unassignMutation.isPending;
  const isAdmin = roleQuery.data?.name.toLowerCase() === "admin";

  const onSave = async () => {
    if (!roleId || isAdmin) return;
    const current = new Set(
      (roleQuery.data?.rolePermissions ?? []).map((rp) => rp.permission.id),
    );
    const toAdd = [...selected].filter((id) => !current.has(id));
    const toRemove = [...current].filter((id) => !selected.has(id));

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
                  <label
                    key={permission.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={selected.has(permission.id)}
                      onCheckedChange={() => toggle(permission.id)}
                      disabled={isAdmin}
                    />
                    {permission.action}
                  </label>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      <Button
        type="button"
        className="w-full mt-2"
        disabled={isSaving || !roleId || isAdmin}
        onClick={onSave}
      >
        {isSaving ? "Saving…" : "Save Permissions"}
      </Button>
    </Modal>
  );
}
