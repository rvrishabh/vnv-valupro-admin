import { institutionTypeQueryKeys } from "@/api/queries/institution-types/institutionTypeQueryKeys";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import { createInstitutionTypePayloadSchema } from "@/schemas/institution-type.schema";
import type { CreateInstitutionTypePayload, InstitutionType } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateInstitutionTypeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateInstitutionTypePayload) => {
      const parsed = createInstitutionTypePayloadSchema.parse(payload);
      const response = await api.post<InstitutionType>(
        "/institution-types",
        parsed,
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Institution type created");
      queryClient.invalidateQueries({ queryKey: institutionTypeQueryKeys.all });
    },
    onError: (err) => toastApiError(err, "Something went wrong"),
  });
}
