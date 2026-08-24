import {
  useApproveUserMutation,
  useDeactivateUserMutation,
} from "@/api/mutations/users";
import { AlertPopup } from "@/components/AlertPopup/AlertPopup";
import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { User } from "@/types";
import { IconBan, IconCircleCheck, IconPencil } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

interface UseUserColumnsOptions {
  onEdit: (user: User) => void;
}

export function useUserColumns({ onEdit }: UseUserColumnsOptions) {
  const approveMutation = useApproveUserMutation();
  const deactivateMutation = useDeactivateUserMutation();
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Email" />
        ),
      },
      {
        id: "role",
        header: "Role",
        cell: ({ row }) => row.original.role?.name ?? "—",
      },
      {
        id: "institution",
        header: "Institution / Branch",
        cell: ({ row }) => {
          const inst = row.original.institution?.name;
          const branch = row.original.branch?.branchName;
          if (!inst && !branch) return "—";
          return [inst, branch].filter(Boolean).join(" / ");
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Badge variant={row.original.isActive ? "default" : "outline"}>
              {row.original.isActive ? "Active" : "Inactive"}
            </Badge>
            {!row.original.isApproved && (
              <Badge variant="destructive">Unapproved</Badge>
            )}
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            {!row.original.isApproved && (
              <Button
                variant="ghost"
                size="icon"
                title="Approve"
                onClick={(e) => {
                  e.stopPropagation();
                  approveMutation.mutate(row.original.id);
                }}
              >
                <IconCircleCheck className="h-4 w-4 text-primary" />
              </Button>
            )}
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
            {row.original.isActive && (
              <AlertPopup
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconBan className="h-4 w-4 text-destructive" />
                  </Button>
                }
                title="Deactivate user?"
                cancelAction="Cancel"
                continueAction={
                  <span
                    onClick={() => deactivateMutation.mutate(row.original.id)}
                  >
                    Deactivate
                  </span>
                }
              >
                "{row.original.name}" will lose access to the platform.
              </AlertPopup>
            )}
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return columns;
}
