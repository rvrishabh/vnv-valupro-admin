import {
  useRejectBranchMutation,
  useVerifyBranchMutation,
} from "@/api/mutations/branches";
import { AlertPopup } from "@/components/AlertPopup/AlertPopup";
import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Branch } from "@/types";
import { IconCheck, IconX } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

function buildBaseColumns(): ColumnDef<Branch>[] {
  return [
    {
      accessorKey: "branchName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Branch" />
      ),
    },
    {
      id: "institution",
      header: "Institution",
      cell: ({ row }) => row.original.institution?.name ?? "—",
    },
    {
      accessorKey: "city",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="City" />
      ),
    },
    {
      accessorKey: "state",
      header: "State",
    },
    {
      accessorKey: "ifscCode",
      header: "IFSC",
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {row.original.ifscCode || "—"}
        </span>
      ),
    },
    {
      id: "source",
      header: "Source",
      cell: ({ row }) => (
        <Badge variant={row.original.isManuallyEntered ? "outline" : "secondary"}>
          {row.original.isManuallyEntered ? "Manual" : "IFSC Lookup"}
        </Badge>
      ),
    },
  ];
}

export function useBranchColumns() {
  return useMemo<ColumnDef<Branch>[]>(
    () => [
      ...buildBaseColumns(),
      {
        id: "verification",
        header: "Verification",
        cell: ({ row }) =>
          row.original.needsVerification ? (
            <Badge variant="destructive">Pending</Badge>
          ) : (
            <Badge variant="default">Verified</Badge>
          ),
      },
    ],
    [],
  );
}

export function useBranchQueueColumns() {
  const verifyMutation = useVerifyBranchMutation();
  const rejectMutation = useRejectBranchMutation();

  return useMemo<ColumnDef<Branch>[]>(
    () => [
      ...buildBaseColumns(),
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="outline"
              size="sm"
              className="text-primary"
              onClick={(e) => {
                e.stopPropagation();
                verifyMutation.mutate(row.original.id);
              }}
            >
              <IconCheck className="h-4 w-4" />
              Verify
            </Button>
            <AlertPopup
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconX className="h-4 w-4" />
                  Reject
                </Button>
              }
              title="Reject branch?"
              cancelAction="Cancel"
              continueAction={
                <span onClick={() => rejectMutation.mutate(row.original.id)}>
                  Reject
                </span>
              }
            >
              This will remove "{row.original.branchName}" from the platform.
            </AlertPopup>
          </div>
        ),
      },
    ],
    [verifyMutation, rejectMutation],
  );
}
