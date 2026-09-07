import { useCircleRateUpliftQuery } from "@/api/queries/circle-rate-uplift";
import { DataTable } from "@/components/DataTable/data-table";
import { Button } from "@/components/ui/button";
import type { TehsilCircleRateUplift } from "@/types";
import { IconPlus } from "@tabler/icons-react";
import { useTehsilUpliftColumns } from "./useTehsilUpliftColumns";

interface TehsilUpliftTableProps {
  onCreate: () => void;
  onEdit: (row: TehsilCircleRateUplift) => void;
}

export function TehsilUpliftTable({ onCreate, onEdit }: TehsilUpliftTableProps) {
  const listQuery = useCircleRateUpliftQuery();
  const columns = useTehsilUpliftColumns({ onEdit });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Circle Rate Uplift by Tehsil &amp; Plot Position
          </h2>
          <p className="text-sm text-muted-foreground">
            Every tehsil + plot position uses the default uplift table
            (0% / 10% / 20%) unless it has a row here. A combination listed
            below uses its own percentage instead, the moment that tehsil
            and plot position are both selected on a valuation — other
            positions in the same tehsil are unaffected.
          </p>
        </div>
        <Button onClick={onCreate}>
          <IconPlus className="h-4 w-4" />
          New Override
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={listQuery.data ?? []}
        isLoading={listQuery.isLoading}
        hideRowsPerPage
      />
    </div>
  );
}
