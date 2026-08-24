import { useDeleteInstitutionMutation } from "@/api/mutations/institutions";
import { AlertPopup } from "@/components/AlertPopup/AlertPopup";
import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Institution } from "@/types";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

interface UseInstitutionColumnsOptions {
  onEdit: (institution: Institution) => void;
  onToggleActive: (institution: Institution) => void;
}

export function useInstitutionColumns({
  onEdit,
  onToggleActive,
}: UseInstitutionColumnsOptions) {
  const deleteMutation = useDeleteInstitutionMutation();

  const columns = useMemo<ColumnDef<Institution>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
      },
      {
        accessorKey: "code",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Code" />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.code}</span>
        ),
      },
      {
        id: "type",
        header: "Type",
        cell: ({ row }) => row.original.institutionType?.name ?? "—",
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={row.original.isActive ? "default" : "outline"}
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive(row.original);
            }}
          >
            {row.original.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
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
              title="Delete institution?"
              cancelAction="Cancel"
              continueAction={
                <span onClick={() => deleteMutation.mutate(row.original.id)}>
                  Delete
                </span>
              }
            >
              This will permanently remove "{row.original.name}". This action
              cannot be undone.
            </AlertPopup>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return columns;
}
