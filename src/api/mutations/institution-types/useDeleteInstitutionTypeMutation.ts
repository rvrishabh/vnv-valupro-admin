import { institutionTypeQueryKeys } from "@/api/queries/institution-types/institutionTypeQueryKeys";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeleteInstitutionTypeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/institution-types/${id}`),
    onSuccess: () => {
      toast.success("Institution type deleted");
      queryClient.invalidateQueries({ queryKey: institutionTypeQueryKeys.all });
    },
    onError: (err) => toastApiError(err, "Unable to delete"),
  });
}
