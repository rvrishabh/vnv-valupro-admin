import { useDeleteTehsilUpliftMutation } from "@/api/mutations/circle-rate-uplift";
import { AlertPopup } from "@/components/AlertPopup/AlertPopup";
import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TehsilCircleRateUplift } from "@/types";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

interface UseTehsilUpliftColumnsOptions {
  onEdit: (row: TehsilCircleRateUplift) => void;
}

export function useTehsilUpliftColumns({
  onEdit,
}: UseTehsilUpliftColumnsOptions) {
  const deleteMutation = useDeleteTehsilUpliftMutation();

  const columns = useMemo<ColumnDef<TehsilCircleRateUplift>[]>(
    () => [
      {
        accessorKey: "tehsil",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Tehsil" />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.tehsil}</span>
        ),
      },
      {
        accessorKey: "plotPosition",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Plot Position" />
        ),
      },
      {
        accessorKey: "upliftPercent",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Uplift" />
        ),
        cell: ({ row }) => (
          <span className="tabular-nums">
            +{Number(row.original.upliftPercent)}%
          </span>
        ),
      },
      {
        accessorKey: "isActive",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge>Active</Badge>
          ) : (
            <Badge variant="outline">
              Inactive — using the default table
            </Badge>
          ),
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Updated" />
        ),
        cell: ({ row }) => new Date(row.original.updatedAt).toLocaleDateString(),
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
              title="Revert to the default uplift?"
              cancelAction="Cancel"
              continueAction={
                <span onClick={() => deleteMutation.mutate(row.original.id)}>
                  Revert
                </span>
              }
            >
              {row.original.tehsil} · {row.original.plotPosition} will go
              back to the default uplift table.
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
