import {
  useBranchesQuery,
  useBranchVerificationQueueQuery,
} from "@/api/queries/branches";
import { DataTable } from "@/components/DataTable/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconPlus } from "@tabler/icons-react";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { useState } from "react";
import { useBranchColumns, useBranchQueueColumns } from "./useBranchColumns";

function buildSort(sorting: SortingState): string | undefined {
  const [first] = sorting;
  if (!first) return undefined;
  return `${first.id}:${first.desc ? "desc" : "asc"}`;
}

interface BranchesTableProps {
  onCreate: () => void;
}

export function BranchesTable({ onCreate }: BranchesTableProps) {
  const [view, setView] = useState<"all" | "queue">("all");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchText, setSearchText] = useState<string>();

  const listQuery = useBranchesQuery(
    {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sort: buildSort(sorting),
      search: searchText,
    },
    { enabled: view === "all" },
  );

  const queueQuery = useBranchVerificationQueueQuery({ enabled: view === "queue" });
  const queueData = queueQuery.data ?? [];

  const allColumns = useBranchColumns();
  const queueColumns = useBranchQueueColumns();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Branches
          </h2>
          <p className="text-sm text-muted-foreground">
            Institution branches, IFSC lookups, and manual verification queue.
          </p>
        </div>
        <Button onClick={onCreate}>
          <IconPlus className="h-4 w-4" />
          New Branch
        </Button>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as "all" | "queue")}>
        <TabsList>
          <TabsTrigger value="all">All Branches</TabsTrigger>
          <TabsTrigger value="queue">
            Verification Queue
            {queueData.length > 0 && (
              <Badge variant="destructive" className="ml-1.5">
                {queueData.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {view === "all" ? (
        <DataTable
          columns={allColumns}
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
      ) : (
        <DataTable
          columns={queueColumns}
          data={queueData}
          isLoading={queueQuery.isLoading}
        />
      )}
    </div>
  );
}
