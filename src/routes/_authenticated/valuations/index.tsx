import { useValuationsQuery } from "@/api/queries/valuations";
import { DataTable } from "@/components/DataTable/data-table";
import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatArea,
  formatInr,
  VALUATION_STATUS_VARIANT,
} from "@/lib/valuation-format";
import type { Valuation } from "@/types";
import { IconFileText } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/_authenticated/valuations/")({
  component: ValuationsPage,
});

function buildSort(sorting: SortingState): string | undefined {
  const [first] = sorting;
  return first ? `${first.id}:${first.desc ? "desc" : "asc"}` : undefined;
}

function ValuationsPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchText, setSearchText] = useState<string>();

  const listQuery = useValuationsQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sort: buildSort(sorting),
    search: searchText,
  });

  const columns = useMemo<ColumnDef<Valuation>[]>(
    () => [
      {
        id: "owner",
        header: "Owner / Case",
        cell: ({ row }) => {
          const owner = (row.original.titleDeed as { ownerName?: string } | null)
            ?.ownerName;
          return (
            <div className="flex flex-col">
              <span className="font-medium">{owner ?? "Untitled draft"}</span>
              <span className="text-xs text-muted-foreground">
                {row.original.case?.caseNumber ?? row.original.caseId.slice(0, 8)}
              </span>
            </div>
          );
        },
      },
      {
        id: "institution",
        header: "Bank",
        cell: ({ row }) => row.original.case?.institution?.name ?? "—",
      },
      {
        accessorKey: "tehsil",
        header: "Tehsil",
        cell: ({ row }) => row.original.tehsil ?? "—",
      },
      {
        accessorKey: "plotAreaSqM",
        header: "Plot Area",
        cell: ({ row }) => formatArea(row.original.plotAreaSqM),
      },
      {
        accessorKey: "roundedMarketValue",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Market Value" />
        ),
        cell: ({ row }) => (
          <span className="font-medium text-primary">
            {formatInr(row.original.roundedMarketValue)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={VALUATION_STATUS_VARIANT[row.original.status] ?? "outline"}>
            {row.original.status}
          </Badge>
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
          <Button asChild variant="ghost" size="sm">
            <Link to="/valuations/$id" params={{ id: row.original.id }}>
              Open
            </Link>
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Valuations
          </h2>
          <p className="text-sm text-muted-foreground">
            Full land &amp; building valuation reports, from site visit to bank PDF.
          </p>
        </div>
        <Button asChild>
          <Link to="/valuations/new">
            <IconFileText className="mr-1 size-4" />
            New Valuation
          </Link>
        </Button>
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
