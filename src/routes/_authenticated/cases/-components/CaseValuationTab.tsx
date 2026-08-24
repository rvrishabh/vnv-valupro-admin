import { useCreateValuationMutation } from "@/api/mutations/valuations";
import { caseQueryKeys } from "@/api/queries/cases";
import { ValuationEditor } from "@/components/Valuation/ValuationEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Case } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

interface CaseValuationTabProps {
  record: Case;
}

export function CaseValuationTab({ record }: CaseValuationTabProps) {
  const createValuation = useCreateValuationMutation();
  const queryClient = useQueryClient();

  if (record.report) {
    return <ValuationEditor valuationId={record.report.id} />;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">No valuation yet</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted-foreground">
          Start the valuation to begin filling in title, site and rate details
          for this case.
        </p>
        <Button
          onClick={() =>
            createValuation.mutate(
              { caseId: record.id },
              {
                onSuccess: () =>
                  queryClient.invalidateQueries({ queryKey: caseQueryKeys.all }),
              },
            )
          }
          disabled={createValuation.isPending}
        >
          {createValuation.isPending ? "Starting…" : "Start valuation"}
        </Button>
      </CardContent>
    </Card>
  );
}
