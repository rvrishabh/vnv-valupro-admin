import { useDeleteCaseMutation } from "@/api/mutations/cases";
import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CASE_STATUS_VARIANT } from "@/lib/case-format";
import { formatInr } from "@/lib/valuation-format";
import type { Case } from "@/types";
import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { DeleteCaseButton } from "./DeleteCaseButton";

export function useCaseColumns() {
  const deleteCase = useDeleteCaseMutation();

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

  return columns;
}
