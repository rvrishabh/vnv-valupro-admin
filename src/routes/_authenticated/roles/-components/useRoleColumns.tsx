import { useDeleteRoleMutation } from "@/api/mutations/roles";
import { AlertPopup } from "@/components/AlertPopup/AlertPopup";
import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Role } from "@/types";
import { IconKey, IconPencil, IconTrash } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

interface UseRoleColumnsOptions {
  onEdit: (role: Role) => void;
  onManagePermissions: (roleId: string) => void;
}

export function useRoleColumns({
  onEdit,
  onManagePermissions,
}: UseRoleColumnsOptions) {
  const deleteMutation = useDeleteRoleMutation();

  const columns = useMemo<ColumnDef<Role>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
      },
      {
        accessorKey: "loginChannel",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Channel" />
        ),
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.loginChannel}</Badge>
        ),
      },
      {
        accessorKey: "description",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Description" />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.description || "—"}
          </span>
        ),
      },
      {
        id: "system",
        header: "",
        cell: ({ row }) =>
          row.original.isSystem ? <Badge>System</Badge> : null,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const isAdmin = row.original.name.toLowerCase() === "admin";
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                title={
                  isAdmin
                    ? "Admin role permissions cannot be changed"
                    : "Manage permissions"
                }
                disabled={isAdmin}
                onClick={(e) => {
                  e.stopPropagation();
                  onManagePermissions(row.original.id);
                }}
              >
                <IconKey className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(row.original);
                }}
              >
                <IconPencil className="h-4 w-4" />
              </Button>
              {!row.original.isSystem && (
                <AlertPopup
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconTrash className="h-4 w-4 text-destructive" />
                    </Button>
                  }
                  title="Delete role?"
                  cancelAction="Cancel"
                  continueAction={
                    <span onClick={() => deleteMutation.mutate(row.original.id)}>
                      Delete
                    </span>
                  }
                >
                  This will permanently remove "{row.original.name}". Roles
                  still referenced by users cannot be deleted.
                </AlertPopup>
              )}
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return columns;
}
