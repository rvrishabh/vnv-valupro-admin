import { useRolesQuery } from "@/api/queries/roles";
import { DataTable } from "@/components/DataTable/data-table";
import { Button } from "@/components/ui/button";
import type { Role } from "@/types";
import { IconPlus } from "@tabler/icons-react";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { useState } from "react";
import { useRoleColumns } from "./useRoleColumns";

function buildSort(sorting: SortingState): string | undefined {
  const [first] = sorting;
  if (!first) return undefined;
  return `${first.id}:${first.desc ? "desc" : "asc"}`;
}

interface RolesTableProps {
  onCreate: () => void;
  onEdit: (role: Role) => void;
  onManagePermissions: (roleId: string) => void;
}

export function RolesTable({
  onCreate,
  onEdit,
  onManagePermissions,
}: RolesTableProps) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchText, setSearchText] = useState<string>();

  const listQuery = useRolesQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sort: buildSort(sorting),
    search: searchText,
  });

  const columns = useRoleColumns({ onEdit, onManagePermissions });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Roles
          </h2>
          <p className="text-sm text-muted-foreground">
            Define roles per login channel and grant them permissions.
          </p>
        </div>
        <Button onClick={onCreate}>
          <IconPlus className="h-4 w-4" />
          New Role
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
