import { institutionQueryKeys } from "@/api/queries/institutions/institutionQueryKeys";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import { createInstitutionPayloadSchema } from "@/schemas/institution.schema";
import type { CreateInstitutionPayload, Institution } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateInstitutionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateInstitutionPayload) => {
      const parsed = createInstitutionPayloadSchema.parse(payload);
      const response = await api.post<Institution>("/institutions", parsed);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Institution created");
      queryClient.invalidateQueries({ queryKey: institutionQueryKeys.all });
    },
    onError: (err) => toastApiError(err, "Something went wrong"),
  });
}
