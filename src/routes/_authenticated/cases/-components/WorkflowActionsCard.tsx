import {
  useAssignCaseMutation,
  useCompleteSurveyMutation,
  useRaiseQueryMutation,
  useStartSurveyMutation,
} from "@/api/mutations/cases";
import { useUsersQuery } from "@/api/queries/users";
import FormComboBox from "@/components/Form/FormComboBox";
import { FormTextArea } from "@/components/Form/FormTextArea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import type { CaseStatus, WorkflowActionsFormValues } from "@/types";
import { useForm, useWatch } from "react-hook-form";

interface WorkflowActionsCardProps {
  caseId: string;
  status: CaseStatus;
  /** Set once the engineer has closed the visit; it cannot be closed twice. */
  surveyCompletedAt?: string | null;
}

export function WorkflowActionsCard({
  caseId,
  status,
  surveyCompletedAt,
}: WorkflowActionsCardProps) {
  const usersQuery = useUsersQuery({ page: 1, limit: 100 });

  const assign = useAssignCaseMutation();
  const startSurvey = useStartSurveyMutation();
  const completeSurvey = useCompleteSurveyMutation();
  const raiseQuery = useRaiseQueryMutation();

  const form = useForm<WorkflowActionsFormValues>({
    defaultValues: { engineerId: "", notes: "" },
  });
  const { control } = form;
  const engineerId = useWatch({ control, name: "engineerId" });
  const notes = useWatch({ control, name: "notes" });

  const canAssign = status === "PENDING" || status === "ASSIGNED";
  const canStart = status === "ASSIGNED";
  // Completing the visit records a milestone rather than moving the case on,
  // so the status alone would leave this enabled and let the same visit be
  // closed repeatedly — each click overwriting the timestamp and adding
  // another audit entry.
  const canComplete = status === "IN_PROGRESS" && !surveyCompletedAt;
  const canQuery = status === "IN_PROGRESS" || status === "CHECKING";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Workflow Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Form {...form}>
          {canAssign ? (
            <div className="flex items-end gap-2">
              <FormComboBox
                control={control}
                name="engineerId"
                label="Assign site visit to engineer"
                placeholder="Select engineer"
                className="flex-1"
                options={(usersQuery.data?.data ?? []).map((user) => ({
                  label: `${user.name} — ${user.role?.name ?? "user"}`,
                  value: user.id,
                }))}
              />
              <Button
                type="button"
                disabled={!engineerId || assign.isPending}
                onClick={() =>
                  assign.mutate({
                    id: caseId,
                    body: { engineerId, notes: notes || undefined },
                  })
                }
              >
                Assign
              </Button>
            </div>
          ) : null}

          <FormTextArea
            control={control}
            name="notes"
            label="Notes (attached to the next action)"
            labelClassName="text-xs text-muted-foreground"
            rows={2}
            placeholder="Optional note recorded in the audit trail"
          />
        </Form>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!canStart || startSurvey.isPending}
            onClick={() => startSurvey.mutate({ id: caseId })}
          >
            Start site visit
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!canComplete || completeSurvey.isPending}
            onClick={() => completeSurvey.mutate({ id: caseId, body: { notes } })}
          >
            {surveyCompletedAt ? "Site visit completed" : "Complete site visit"}
          </Button>
          <Button
            type="button"
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
