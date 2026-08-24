import { useDeleteCaseMutation } from "@/api/mutations/cases";
import { Badge } from "@/components/ui/badge";
import { CASE_STATUS_VARIANT } from "@/lib/case-format";
import type { Case } from "@/types";
import { Link, useNavigate } from "@tanstack/react-router";
import { DeleteCaseButton } from "./DeleteCaseButton";

interface CaseDetailHeaderProps {
  record: Case;
}

export function CaseDetailHeader({ record }: CaseDetailHeaderProps) {
  const navigate = useNavigate();
  const deleteCase = useDeleteCaseMutation();

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="font-display text-xl font-semibold">{record.caseNumber}</h2>
          <Badge variant={CASE_STATUS_VARIANT[record.status] ?? "outline"}>
            {record.status.replace(/_/g, " ")}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {record.customerName} · {record.institution?.name ?? "Bank"} ·{" "}
          <Link to="/cases" className="underline">
            Back to cases
          </Link>
        </p>
      </div>

      <div className="flex items-center gap-2">
        <DeleteCaseButton
          caseNumber={record.caseNumber}
          hasValuation={Boolean(record.report)}
          variant="full"
          onConfirm={() =>
            deleteCase.mutate(record.id, {
              onSuccess: () => navigate({ to: "/cases" }),
            })
          }
        />
      </div>
    </div>
  );
}
