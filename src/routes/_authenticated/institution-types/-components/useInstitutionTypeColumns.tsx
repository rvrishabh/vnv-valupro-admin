import { useDeleteInstitutionTypeMutation } from "@/api/mutations/institution-types";
import { AlertPopup } from "@/components/AlertPopup/AlertPopup";
import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header";
import { Button } from "@/components/ui/button";
import type { InstitutionType } from "@/types";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

interface UseInstitutionTypeColumnsOptions {
  onEdit: (institutionType: InstitutionType) => void;
}

export function useInstitutionTypeColumns({
  onEdit,
}: UseInstitutionTypeColumnsOptions) {
  const deleteMutation = useDeleteInstitutionTypeMutation();

  const columns = useMemo<ColumnDef<InstitutionType>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
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
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Created" />
        ),
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
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
              title="Delete institution type?"
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
