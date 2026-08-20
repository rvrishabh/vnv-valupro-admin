import { roleQueryKeys } from "@/api/queries/roles/roleQueryKeys";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import type { Role } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUnassignPermissionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      permissionId,
    }: {
      id: string;
      permissionId: string;
    }) => {
      const response = await api.delete<Role>(
        `/roles/${id}/permissions/${permissionId}`,
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.detail(id) });
    },
    onError: (err) => toastApiError(err, "Unable to remove permission"),
  });
}
