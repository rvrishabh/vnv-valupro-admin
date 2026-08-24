import { useValuationEstimatesQuery } from "@/api/queries/valuation-estimates";
import { DataTable } from "@/components/DataTable/data-table";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { useState } from "react";
import { useValuationEstimateColumns } from "./useValuationEstimateColumns";

function buildSort(sorting: SortingState): string | undefined {
  const [first] = sorting;
  if (!first) return undefined;
  return `${first.id}:${first.desc ? "desc" : "asc"}`;
}

export function ValuationEstimatesTable() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchText, setSearchText] = useState<string>();

  const listQuery = useValuationEstimatesQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sort: buildSort(sorting),
    search: searchText,
  });

  const columns = useValuationEstimateColumns();

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
