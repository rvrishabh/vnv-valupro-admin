export const CASE_STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "outline",
  ASSIGNED: "secondary",
  IN_PROGRESS: "secondary",
  CHECKING: "secondary",
  QUERY_RAISED: "destructive",
  APPROVED: "default",
  REJECTED: "destructive",
};

/** Human labels for the audit actions the workflow service writes. */
export const CASE_ACTION_LABELS: Record<string, string> = {
  CASE_CREATED: "Case created",
  CASE_ASSIGNED: "Assigned to site engineer",
  SURVEY_STARTED: "Site visit started",
  SURVEY_COMPLETED: "Site visit completed",
  REPORT_SUBMITTED: "Valuation submitted for checking",
  REPORT_APPROVED: "Valuation approved",
  REPORT_REJECTED: "Valuation rejected",
  QUERY_RAISED: "Query raised",
};

export const MILESTONE_LABELS: [string, string][] = [
  ["createdAt", "Case created"],
  ["assignedAt", "Assigned to engineer"],
  ["surveyStartedAt", "Site visit started"],
  ["surveyCompletedAt", "Site visit completed"],
  ["submittedAt", "Report submitted"],
  ["approvedAt", "Report approved"],
  ["rejectedAt", "Report rejected"],
];

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
