import { userQueryKeys } from "@/api/queries/users/userQueryKeys";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import { updateUserBranchPayloadSchema } from "@/schemas/user.schema";
import type { User } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateUserBranchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, branchId }: { id: string; branchId: string }) => {
      const parsed = updateUserBranchPayloadSchema.parse({ branchId });
      const response = await api.patch<User>(`/users/${id}/branch`, parsed);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Branch updated");
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
    onError: (err) => toastApiError(err, "Something went wrong"),
  });
}
