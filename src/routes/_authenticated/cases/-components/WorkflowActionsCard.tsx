import {
  useAssignCaseMutation,
  useCompleteSurveyMutation,
  useRaiseQueryMutation,
  useStartSurveyMutation,
} from "@/api/mutations/cases";
import { useUsersQuery } from "@/api/queries/users";
import { Dropdown } from "@/components/Dropdowns/Dropdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CaseStatus } from "@/types";
import { useState } from "react";

interface WorkflowActionsCardProps {
  caseId: string;
  status: CaseStatus;
}

export function WorkflowActionsCard({ caseId, status }: WorkflowActionsCardProps) {
  const usersQuery = useUsersQuery({ page: 1, limit: 100 });

  const assign = useAssignCaseMutation();
  const startSurvey = useStartSurveyMutation();
  const completeSurvey = useCompleteSurveyMutation();
  const raiseQuery = useRaiseQueryMutation();

  const [engineerId, setEngineerId] = useState("");
  const [notes, setNotes] = useState("");

  const canAssign = status === "PENDING" || status === "ASSIGNED";
  const canStart = status === "ASSIGNED";
  const canComplete = status === "IN_PROGRESS";
  const canQuery = status === "IN_PROGRESS" || status === "CHECKING";

  return (
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
              <Dropdown
                className="flex-1"
                placeholder="Select engineer"
                value={engineerId}
                onChange={setEngineerId}
                options={(usersQuery.data?.data ?? []).map((user) => ({
                  label: `${user.name} — ${user.role?.name ?? "user"}`,
                  value: user.id,
                }))}
              />
              <Button
                disabled={!engineerId || assign.isPending}
                onClick={() =>
                  assign.mutate({ id: caseId, body: { engineerId, notes: notes || undefined } })
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
            onClick={() => startSurvey.mutate({ id: caseId })}
          >
            Start site visit
          </Button>
          <Button
            variant="outline"
            disabled={!canComplete || completeSurvey.isPending}
            onClick={() => completeSurvey.mutate({ id: caseId, body: { notes } })}
          >
            Complete site visit
          </Button>
          <Button
            variant="destructive"
            disabled={!canQuery || !notes || raiseQuery.isPending}
            onClick={() => raiseQuery.mutate({ id: caseId, body: { notes } })}
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
  );
}
