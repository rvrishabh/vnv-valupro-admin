import { institutionQueryKeys } from "@/api/queries/institutions/institutionQueryKeys";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeleteInstitutionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/institutions/${id}`),
    onSuccess: () => {
      toast.success("Institution deleted");
      queryClient.invalidateQueries({ queryKey: institutionQueryKeys.all });
    },
    onError: (err) => toastApiError(err, "Unable to delete"),
  });
}
