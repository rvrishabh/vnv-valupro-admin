import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header";
import type { ValuationEstimate } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function useValuationEstimateColumns() {
  const columns = useMemo<ColumnDef<ValuationEstimate>[]>(
    () => [
      {
        accessorKey: "ownerName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Owner" />
        ),
      },
      {
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => (
          <span className="line-clamp-1 max-w-xs">{row.original.address}</span>
        ),
      },
      {
        accessorKey: "plotAreaSqFt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Plot Area (sq ft)" />
        ),
        cell: ({ row }) => row.original.plotAreaSqFt.toLocaleString("en-IN"),
      },
      {
        accessorKey: "rate",
        header: "Rate / sq ft",
        cell: ({ row }) => currencyFormatter.format(row.original.rate),
      },
      {
        accessorKey: "estimatedAmount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Estimated Amount" />
        ),
        cell: ({ row }) => (
          <span className="font-medium text-primary">
            {currencyFormatter.format(row.original.estimatedAmount)}
          </span>
        ),
      },
      {
        id: "createdBy",
        header: "Created By",
        cell: ({ row }) => row.original.creator?.name ?? "—",
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Created" />
        ),
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
      },
    ],
    [],
  );

  return columns;
}
