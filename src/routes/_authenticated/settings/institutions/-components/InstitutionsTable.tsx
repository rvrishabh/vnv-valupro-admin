import { useInstitutionsQuery } from "@/api/queries/institutions";
import { DataTable } from "@/components/DataTable/data-table";
import { Button } from "@/components/ui/button";
import type { Institution } from "@/types";
import { IconPlus } from "@tabler/icons-react";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { useState } from "react";
import { useInstitutionColumns } from "./useInstitutionColumns";

function buildSort(sorting: SortingState): string | undefined {
  const [first] = sorting;
  if (!first) return undefined;
  return `${first.id}:${first.desc ? "desc" : "asc"}`;
}

interface InstitutionsTableProps {
  onCreate: () => void;
  onEdit: (institution: Institution) => void;
  onToggleActive: (institution: Institution) => void;
}

export function InstitutionsTable({
  onCreate,
  onEdit,
  onToggleActive,
}: InstitutionsTableProps) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchText, setSearchText] = useState<string>();

  const listQuery = useInstitutionsQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sort: buildSort(sorting),
    search: searchText,
  });

  const columns = useInstitutionColumns({ onEdit, onToggleActive });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Institutions
          </h2>
          <p className="text-sm text-muted-foreground">
            Banks and other lending institutions on the platform.
          </p>
        </div>
        <Button onClick={onCreate}>
          <IconPlus className="h-4 w-4" />
          New Institution
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
