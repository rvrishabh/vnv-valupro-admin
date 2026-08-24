import { useCasesQuery } from "@/api/queries/cases";
import { DataTable } from "@/components/DataTable/data-table";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { useState } from "react";
import { useCaseColumns } from "./useCaseColumns";

function buildSort(sorting: SortingState): string | undefined {
  const [first] = sorting;
  return first ? `${first.id}:${first.desc ? "desc" : "asc"}` : undefined;
}

export function CasesTable() {
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

  const columns = useCaseColumns();

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
