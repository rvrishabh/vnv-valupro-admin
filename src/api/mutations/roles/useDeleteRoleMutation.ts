import { roleQueryKeys } from "@/api/queries/roles/roleQueryKeys";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeleteRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/roles/${id}`),
    onSuccess: () => {
      toast.success("Role deleted");
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.all });
    },
    onError: (err) => toastApiError(err, "Unable to delete"),
  });
}
