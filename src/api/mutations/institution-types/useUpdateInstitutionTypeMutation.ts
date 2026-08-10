import { institutionTypeQueryKeys } from "@/api/queries/institution-types/institutionTypeQueryKeys";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import { updateInstitutionTypePayloadSchema } from "@/schemas/institution-type.schema";
import type { InstitutionType, UpdateInstitutionTypePayload } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateInstitutionTypeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateInstitutionTypePayload;
    }) => {
      const parsed = updateInstitutionTypePayloadSchema.parse(data);
      const response = await api.patch<InstitutionType>(
        `/institution-types/${id}`,
        parsed,
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Institution type updated");
      queryClient.invalidateQueries({ queryKey: institutionTypeQueryKeys.all });
    },
    onError: (err) => toastApiError(err, "Something went wrong"),
  });
}
