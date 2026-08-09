import { valuationEstimatesApi } from "@/api/valuation-estimates.api";
import { DataTable } from "@/components/DataTable/data-table";
import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header";
import type { ValuationEstimate } from "@/types/valuation-estimate.types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/_authenticated/valuation-estimates/")({
  component: ValuationEstimatesPage,
});

function buildSort(sorting: SortingState): string | undefined {
  const [first] = sorting;
  if (!first) return undefined;
  return `${first.id}:${first.desc ? "desc" : "asc"}`;
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function ValuationEstimatesPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchText, setSearchText] = useState<string>();

  const listQuery = useQuery({
    queryKey: ["valuation-estimates", pagination, sorting, searchText],
    queryFn: () =>
      valuationEstimatesApi.list({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        sort: buildSort(sorting),
        search: searchText,
      }),
  });

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

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-xl font-semibold text-foreground">
          Valuation Estimates
        </h2>
        <p className="text-sm text-muted-foreground">
          Quick property valuation estimates generated across the platform.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={listQuery.data?.data ?? []}
        isLoading={listQuery.isLoading}
        toolbar
        searchText={searchText}
        setSearchText={setSearchText}
        pagination={pagination}
        setPagination={setPagination}
        sorting={sorting}
        setSorting={setSorting}
        pageCount={listQuery.data?.totalPages ?? 0}
      />
    </div>
  );
}
