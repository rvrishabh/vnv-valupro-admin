import { useInstitutionTypesQuery } from "@/api/queries/institution-types";
import { DataTable } from "@/components/DataTable/data-table";
import { Button } from "@/components/ui/button";
import type { InstitutionType } from "@/types";
import { IconPlus } from "@tabler/icons-react";
import type { SortingState } from "@tanstack/react-table";
import { useState } from "react";
import { useInstitutionTypeColumns } from "./useInstitutionTypeColumns";

function buildSort(sorting: SortingState): string | undefined {
  const [first] = sorting;
  if (!first) return undefined;
  return `${first.id}:${first.desc ? "desc" : "asc"}`;
}

interface InstitutionTypesTableProps {
  onCreate: () => void;
  onEdit: (institutionType: InstitutionType) => void;
}

export function InstitutionTypesTable({
  onCreate,
  onEdit,
}: InstitutionTypesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchText, setSearchText] = useState<string>();

  // GET /institution-types returns a plain (non-paginated) array — fetch a
  // generous limit and let the table render everything without server-side
  // pagination (see the comment in api/institution-types.api.ts).
  const listQuery = useInstitutionTypesQuery({
    limit: 100,
    sort: buildSort(sorting),
    search: searchText,
  });

  const columns = useInstitutionTypeColumns({ onEdit });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Institution Types
          </h2>
          <p className="text-sm text-muted-foreground">
            Categories institutions are grouped under (e.g. Bank, NBFC).
          </p>
        </div>
        <Button onClick={onCreate}>
          <IconPlus className="h-4 w-4" />
          New Type
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={listQuery.data ?? []}
        isLoading={listQuery.isLoading}
        toolbar
        searchText={searchText}
        setSearchText={setSearchText}
        sorting={sorting}
        setSorting={setSorting}
        hideRowsPerPage
      />
    </div>
  );
}
