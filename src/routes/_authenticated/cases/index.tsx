import { useCasesQuery } from "@/api/queries/cases";
import { DataTable } from "@/components/DataTable/data-table";
import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CASE_STATUS_VARIANT } from "@/lib/case-format";
import type { Case } from "@/types";
import { IconPlus } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/_authenticated/cases/")({
  component: CasesPage,
});

function buildSort(sorting: SortingState): string | undefined {
  const [first] = sorting;
  return first ? `${first.id}:${first.desc ? "desc" : "asc"}` : undefined;
}

function CasesPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchText, setSearchText] = useState<string>();

  const listQuery = useCasesQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sort: buildSort(sorting),
    search: searchText,
  });

  const columns = useMemo<ColumnDef<Case>[]>(
    () => [
      {
        accessorKey: "caseNumber",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Case No." />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.caseNumber}</span>
        ),
      },
      {
        accessorKey: "customerName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Customer" />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span>{row.original.customerName}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.customerMobile}
            </span>
          </div>
        ),
      },
      {
        id: "institution",
        header: "Bank",
        cell: ({ row }) => row.original.institution?.name ?? "—",
      },
      {
        accessorKey: "propertyType",
        header: "Property",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span>{row.original.propertyType}</span>
            <span className="line-clamp-1 max-w-[16rem] text-xs text-muted-foreground">
              {row.original.propertyLocation ?? "—"}
            </span>
          </div>
        ),
      },
      {
        id: "assignedTo",
        header: "Site Engineer",
        cell: ({ row }) => row.original.assignedTo?.name ?? "Unassigned",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={CASE_STATUS_VARIANT[row.original.status] ?? "outline"}>
            {row.original.status.replace(/_/g, " ")}
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
            <Link to="/cases/$id" params={{ id: row.original.id }}>
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
          <h2 className="font-display text-xl font-semibold text-foreground">Cases</h2>
          <p className="text-sm text-muted-foreground">
            Every valuation belongs to a case — from bank intake through site visit,
            checking and the final report.
          </p>
        </div>
        <Button asChild>
          <Link to="/valuations/new">
            <IconPlus className="mr-1 size-4" />
            New Case
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
