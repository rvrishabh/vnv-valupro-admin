import {
  useAssignCaseMutation,
  useCompleteSurveyMutation,
  useRaiseQueryMutation,
  useStartSurveyMutation,
} from "@/api/mutations/cases";
import { useCaseQuery, useCaseTimelineQuery } from "@/api/queries/cases";
import { useUsersQuery } from "@/api/queries/users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CASE_ACTION_LABELS,
  CASE_STATUS_VARIANT,
  formatDateTime,
  MILESTONE_LABELS,
} from "@/lib/case-format";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/cases/$id")({
  component: CaseDetailPage,
});

function CaseDetailPage() {
  const { id } = Route.useParams();
  const caseQuery = useCaseQuery(id);
  const timelineQuery = useCaseTimelineQuery(id);
  const usersQuery = useUsersQuery({ page: 1, limit: 100 });

  const assign = useAssignCaseMutation();
  const startSurvey = useStartSurveyMutation();
  const completeSurvey = useCompleteSurveyMutation();
  const raiseQuery = useRaiseQueryMutation();

  const [engineerId, setEngineerId] = useState("");
  const [notes, setNotes] = useState("");

  const record = caseQuery.data;
  const timeline = timelineQuery.data;

  if (caseQuery.isLoading || !record) {
    return <p className="text-sm text-muted-foreground">Loading case…</p>;
  }

  const status = record.status;
  const canAssign = status === "PENDING" || status === "ASSIGNED";
  const canStart = status === "ASSIGNED";
  const canComplete = status === "IN_PROGRESS";
  const canQuery = status === "IN_PROGRESS" || status === "CHECKING";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-semibold">{record.caseNumber}</h2>
            <Badge variant={CASE_STATUS_VARIANT[status] ?? "outline"}>
              {status.replace(/_/g, " ")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {record.customerName} · {record.institution?.name ?? "Bank"} ·{" "}
            <Link to="/cases" className="underline">
              Back to cases
            </Link>
          </p>
        </div>

        {record.report?.id ? (
          <Button asChild>
            <Link to="/valuations/$id" params={{ id: record.report.id }}>
              Open valuation
            </Link>
          </Button>
        ) : (
          <Badge variant="outline">No valuation yet</Badge>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Case Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
              <Detail label="Customer" value={record.customerName} />
              <Detail label="Contact" value={record.customerMobile} />
              <Detail label="Bank" value={record.institution?.name} />
              <Detail label="Branch" value={record.branch?.branchName} />
              <Detail label="Property type" value={record.propertyType} />
              <Detail label="Bank reference" value={record.bankReference} />
              <div className="sm:col-span-2">
                <Detail label="Property location" value={record.propertyLocation} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Workflow Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {canAssign ? (
                <div className="flex flex-col gap-2">
                  <Label className="text-xs text-muted-foreground">
                    Assign site visit to engineer
                  </Label>
                  <div className="flex gap-2">
                    <Select value={engineerId} onValueChange={setEngineerId}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select engineer" />
                      </SelectTrigger>
                      <SelectContent>
                        {(usersQuery.data?.data ?? []).map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} — {user.role?.name ?? "user"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      disabled={!engineerId || assign.isPending}
                      onClick={() =>
                        assign.mutate({ id, body: { engineerId, notes: notes || undefined } })
                      }
                    >
                      Assign
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">
                  Notes (attached to the next action)
                </Label>
                <Textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional note recorded in the audit trail"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={!canStart || startSurvey.isPending}
                  onClick={() => startSurvey.mutate({ id })}
                >
                  Start site visit
                </Button>
                <Button
                  variant="outline"
                  disabled={!canComplete || completeSurvey.isPending}
                  onClick={() => completeSurvey.mutate({ id, body: { notes } })}
                >
                  Complete site visit
                </Button>
                <Button
                  variant="destructive"
                  disabled={!canQuery || !notes || raiseQuery.isPending}
                  onClick={() => raiseQuery.mutate({ id, body: { notes } })}
                >
                  Raise query
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Actions unavailable for the current status are disabled — the backend
                rejects any transition that isn't valid from {status.replace(/_/g, " ")}.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              {timeline?.events?.length ? (
                <ol className="flex flex-col gap-3">
                  {timeline.events.map((event) => (
                    <li key={event.id} className="flex gap-3 text-sm">
                      <div className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {CASE_ACTION_LABELS[event.action] ?? event.action}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(event.createdAt)} · {event.actor?.name}
                          {event.oldStatus
                            ? ` · ${event.oldStatus} → ${event.newStatus}`
                            : ` · ${event.newStatus ?? ""}`}
                        </span>
                        {event.notes ? (
                          <span className="mt-0.5 text-xs italic text-muted-foreground">
                            “{event.notes}”
                          </span>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground">No events recorded yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">People</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <Detail label="Created by" value={timeline?.participants?.createdBy?.name} />
              <Detail
                label="Site engineer"
                value={timeline?.participants?.assignedTo?.name}
              />
              <Detail label="Checker" value={timeline?.participants?.checkedBy?.name} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Milestones</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5 text-sm">
              {MILESTONE_LABELS.map(([key, label]) => {
                const value = timeline?.milestones?.[
                  key as keyof NonNullable<typeof timeline>["milestones"]
                ];
                return (
                  <div
                    key={key}
                    className="flex items-baseline justify-between gap-3 border-b border-dashed py-1 last:border-none"
                  >
                    <span className="text-muted-foreground">{label}</span>
                    <span className={value ? "tabular-nums" : "text-muted-foreground"}>
                      {formatDateTime(value)}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span>{value || "—"}</span>
    </div>
  );
}
