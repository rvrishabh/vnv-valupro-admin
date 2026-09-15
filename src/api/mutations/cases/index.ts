import { caseQueryKeys } from "@/api/queries/cases";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import { createCasePayloadSchema, updateCasePayloadSchema } from "@/schemas";
import type { Case, CreateCasePayload, UpdateCasePayload } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateCaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCasePayload) => {
      const parsed = createCasePayloadSchema.parse(payload);
      const response = await api.post<Case>("/cases", parsed);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caseQueryKeys.all });
    },
    onError: (err) => toastApiError(err, "Unable to create the case"),
  });
}

/** PATCH /cases/:id — the case's own details, not a workflow transition. */
export function useUpdateCaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCasePayload;
    }) => {
      const parsed = updateCasePayloadSchema.parse(data);
      const response = await api.patch<Case>(`/cases/${id}`, parsed);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Case details updated");
      queryClient.invalidateQueries({ queryKey: caseQueryKeys.all });
    },
    onError: (err) => toastApiError(err, "Unable to update the case"),
  });
}

/** Status transitions all go through the backend workflow service. */
function useCaseTransition<TBody>(
  path: (id: string) => string,
  successMessage: string,
  failureMessage: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body?: TBody }) => {
      const response = await api.post<Case>(path(id), body);
      return response.data;
    },
    onSuccess: () => {
      toast.success(successMessage);
      queryClient.invalidateQueries({ queryKey: caseQueryKeys.all });
    },
    onError: (err) => toastApiError(err, failureMessage),
  });
}

export function useAssignCaseMutation() {
  return useCaseTransition<{ engineerId: string; notes?: string }>(
    (id) => `/cases/${id}/assign`,
    "Case assigned",
    "Unable to assign the case",
  );
}

export function useAssignCheckerMutation() {
  return useCaseTransition<{ checkerId: string; notes?: string }>(
    (id) => `/cases/${id}/assign-checker`,
    "Checker assigned",
    "Unable to assign the checker",
  );
}

export function useStartSurveyMutation() {
  return useCaseTransition(
    (id) => `/cases/${id}/survey/start`,
    "Site visit started",
    "Unable to start the site visit",
  );
}

export function useCompleteSurveyMutation() {
  return useCaseTransition<{ notes: string }>(
    (id) => `/cases/${id}/survey/complete`,
    "Site visit completed",
    "Unable to complete the site visit",
  );
}

export function useRaiseQueryMutation() {
  return useCaseTransition<{ notes: string }>(
    (id) => `/cases/${id}/query`,
    "Query raised",
    "Unable to raise the query",
  );
}

/**
 * Hard-deletes a case together with its valuation, documents, fees, queries and
 * audit trail. Irreversible — the caller must confirm first.
 */
export function useDeleteCaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<{ id: string; caseNumber: string }>(
        `/cases/${id}`,
      );
      return response.data;
    },
    onSuccess: (deleted) => {
      toast.success(`Case ${deleted?.caseNumber ?? ""} deleted`.trim());
      queryClient.invalidateQueries({ queryKey: caseQueryKeys.all });
      // The valuation went with it, so that list is stale too.
      queryClient.invalidateQueries({ queryKey: ["valuations"] });
    },
    onError: (err) => toastApiError(err, "Unable to delete the case"),
  });
}
