import type { Case, CaseTimeline } from "@/types";
import { AuditTrailCard } from "./AuditTrailCard";
import { CaseDetailsCard } from "./CaseDetailsCard";
import { CaseSidebar } from "./CaseSidebar";
import { WorkflowActionsCard } from "./WorkflowActionsCard";

interface CaseOverviewTabProps {
  record: Case;
  timeline?: CaseTimeline;
}

export function CaseOverviewTab({ record, timeline }: CaseOverviewTabProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex flex-col gap-4">
        <CaseDetailsCard record={record} />
        <WorkflowActionsCard
          caseId={record.id}
          status={record.status}
          surveyCompletedAt={record.surveyCompletedAt}
        />
        <AuditTrailCard timeline={timeline} />
      </div>

      <CaseSidebar timeline={timeline} />
    </div>
  );
}
