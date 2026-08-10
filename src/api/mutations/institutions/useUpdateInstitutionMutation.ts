import { institutionQueryKeys } from "@/api/queries/institutions/institutionQueryKeys";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import { updateInstitutionPayloadSchema } from "@/schemas/institution.schema";
import type { Institution, UpdateInstitutionPayload } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateInstitutionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateInstitutionPayload;
    }) => {
      const parsed = updateInstitutionPayloadSchema.parse(data);
      const response = await api.patch<Institution>(
        `/institutions/${id}`,
        parsed,
      );
      return response.data;
    },
    onSuccess: () => {
      // No default success toast: this mutation backs both the edit-save
      // flow and the inline active/inactive toggle, which want different
      // (or no) messaging — callers pass their own onSuccess to mutate().
      queryClient.invalidateQueries({ queryKey: institutionQueryKeys.all });
    },
    onError: (err) => toastApiError(err, "Something went wrong"),
  });
}
