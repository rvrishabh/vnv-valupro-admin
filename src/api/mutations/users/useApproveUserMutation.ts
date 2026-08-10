import { userQueryKeys } from "@/api/queries/users/userQueryKeys";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import type { User } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useApproveUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch<User>(`/users/${id}/approve`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("User approved");
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
    onError: (err) => toastApiError(err, "Unable to approve"),
  });
}
