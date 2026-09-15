import { branchQueryKeys } from "@/api/queries/branches/branchQueryKeys";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * DELETE /branches/:id — used both to reject a pending branch in the
 * verification queue and to delete an already-verified one from the main
 * list, so the messaging here stays neutral rather than assuming either.
 */
export function useRejectBranchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/branches/${id}`),
    onSuccess: () => {
      toast.success("Branch removed");
      queryClient.invalidateQueries({ queryKey: branchQueryKeys.all });
    },
    onError: (err) => toastApiError(err, "Unable to remove the branch"),
  });
}
