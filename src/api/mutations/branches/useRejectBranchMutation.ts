import { branchQueryKeys } from "@/api/queries/branches/branchQueryKeys";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useRejectBranchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/branches/${id}`),
    onSuccess: () => {
      toast.success("Branch rejected");
      queryClient.invalidateQueries({ queryKey: branchQueryKeys.all });
    },
    onError: (err) => toastApiError(err, "Unable to reject"),
  });
}
