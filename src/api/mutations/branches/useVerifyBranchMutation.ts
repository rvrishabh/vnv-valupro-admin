import { branchQueryKeys } from "@/api/queries/branches/branchQueryKeys";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import type { Branch } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useVerifyBranchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch<Branch>(`/branches/${id}/verify`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Branch verified");
      queryClient.invalidateQueries({ queryKey: branchQueryKeys.all });
    },
    onError: (err) => toastApiError(err, "Unable to verify"),
  });
}
