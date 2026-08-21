import { useDeleteCaseMutation } from "@/api/mutations/cases";
import { useCasesQuery } from "@/api/queries/cases";
import { DataTable } from "@/components/DataTable/data-table";
import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CASE_STATUS_VARIANT } from "@/lib/case-format";
import { formatInr } from "@/lib/valuation-format";
import type { Case } from "@/types";
import { IconPlus, IconTrash } from "@tabler/icons-react";
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
  const deleteCase = useDeleteCaseMutation();

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
        id: "valuation",
        header: "Valuation",
        cell: ({ row }) => {
          const report = row.original.report;
          if (!report) {
            return <span className="text-xs text-muted-foreground">Not started</span>;
          }
          return (
            <Link
              to="/cases/$id"
              params={{ id: row.original.id }}
              search={{ tab: "valuation" }}
              className="flex flex-col hover:underline"
            >
              <span className="font-medium text-primary">
                {formatInr(report.roundedMarketValue)}
              </span>
              <span className="text-xs text-muted-foreground">{report.status}</span>
            </Link>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button asChild variant="ghost" size="sm">
              <Link to="/cases/$id" params={{ id: row.original.id }}>
                Open
              </Link>
            </Button>
            <DeleteCaseButton
              caseNumber={row.original.caseNumber}
              hasValuation={Boolean(row.original.report)}
              onConfirm={() => deleteCase.mutate(row.original.id)}
            />
          </div>
        ),
      },
    ],
    [deleteCase],
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
          <Link to="/cases/new">
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

/**
 * Deleting a case takes its valuation and audit trail with it, so the dialog
 * says so plainly rather than asking a generic "are you sure?".
 */
function DeleteCaseButton({
  caseNumber,
  hasValuation,
  onConfirm,
}: {
  caseNumber: string;
  hasValuation: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          aria-label={`Delete case ${caseNumber}`}
        >
          <IconTrash className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete case {caseNumber}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the case
            {hasValuation ? ", its valuation report" : ""}, along with any documents,
            fees, queries and the full audit trail. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            Delete case
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
