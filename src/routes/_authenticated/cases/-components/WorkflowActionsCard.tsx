import {
  useAssignCaseMutation,
  useAssignCheckerMutation,
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
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

interface WorkflowActionsCardProps {
  caseId: string;
  status: CaseStatus;
  /** Set once the engineer has closed the visit; it cannot be closed twice. */
  surveyCompletedAt?: string | null;
  /** Who the case is currently assigned to, if anyone — pre-fills the combo box so it survives a refresh instead of resetting to blank. */
  assignedToId?: string | null;
  /** Who's currently the checker on record, if anyone — same pre-fill treatment. */
  checkedById?: string | null;
}

export function WorkflowActionsCard({
  caseId,
  status,
  surveyCompletedAt,
  assignedToId,
  checkedById,
}: WorkflowActionsCardProps) {
  const usersQuery = useUsersQuery({ page: 1, limit: 100 });

  const assign = useAssignCaseMutation();
  const assignChecker = useAssignCheckerMutation();
  const startSurvey = useStartSurveyMutation();
  const completeSurvey = useCompleteSurveyMutation();
  const raiseQuery = useRaiseQueryMutation();

  const form = useForm<WorkflowActionsFormValues>({
    defaultValues: {
      engineerId: assignedToId ?? "",
      checkerId: checkedById ?? "",
      notes: "",
    },
  });
  const { control, setValue } = form;
  const engineerId = useWatch({ control, name: "engineerId" });
  const checkerId = useWatch({ control, name: "checkerId" });
  const notes = useWatch({ control, name: "notes" });

  // Keeps both fields in sync with the case's actual assignment — on the
  // initial load (so a refresh doesn't show them blank) and after a
  // (re)assignment updates the record — without using react-hook-form's
  // reactive `values` prop, which would also wipe out an in-progress note
  // every time the case record refetches.
  useEffect(() => {
    setValue("engineerId", assignedToId ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedToId]);

  useEffect(() => {
    setValue("checkerId", checkedById ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedById]);

  // Reassignment is allowed at these points; a decided case has nothing left
  // to hand off — matches the backend's own gates on these two endpoints.
  const canAssign = status === "PENDING" || status === "ASSIGNED";
  const canAssignChecker = status !== "APPROVED" && status !== "REJECTED";
  const canStart = status === "ASSIGNED";
  // Completing the visit records a milestone rather than moving the case on,
  // so the status alone would leave this enabled and let the same visit be
  // closed repeatedly — each click overwriting the timestamp and adding
  // another audit entry.
  const canComplete = status === "IN_PROGRESS" && !surveyCompletedAt;
  const canQuery = status === "IN_PROGRESS" || status === "CHECKING";

  const users = usersQuery.data?.data ?? [];

  /**
   * The dropdown normally only offers people with the matching role, but the
   * currently-assigned person has to stay visible even if that's no longer
   * (or was never) true — a role change after assignment, or an assignment
   * made outside this filter — otherwise the box goes blank even though the
   * assignment is real, which reads as broken rather than just unusual.
   */
  function roleOptions(role: string, currentId?: string | null) {
    const options = users
      .filter((user) => user.role?.name === role)
      .map((user) => ({ label: user.name, value: user.id }));

    if (currentId && !options.some((o) => o.value === currentId)) {
      const current = users.find((u) => u.id === currentId);
      if (current) options.push({ label: current.name, value: current.id });
    }

    return options;
  }

  const engineerOptions = roleOptions("SITE_ENGINEER", assignedToId);
  const checkerOptions = roleOptions("CHECKER", checkedById);

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
                options={engineerOptions}
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

          {canAssignChecker ? (
            <div className="flex items-end gap-2">
              <FormComboBox
                control={control}
                name="checkerId"
                label="Assign checker"
                placeholder="Select checker"
                className="flex-1"
                options={checkerOptions}
              />
              <Button
                type="button"
                variant="outline"
                disabled={!checkerId || assignChecker.isPending}
                onClick={() =>
                  assignChecker.mutate({
                    id: caseId,
                    body: { checkerId, notes: notes || undefined },
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
