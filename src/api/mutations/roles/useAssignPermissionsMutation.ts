import { roleQueryKeys } from "@/api/queries/roles/roleQueryKeys";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import { assignPermissionsPayloadSchema } from "@/schemas/role.schema";
import type { AssignPermissionsPayload, Role } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAssignPermissionsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: AssignPermissionsPayload;
    }) => {
      const parsed = assignPermissionsPayloadSchema.parse(data);
      const response = await api.post<Role>(
        `/roles/${id}/permissions`,
        parsed,
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.detail(id) });
    },
    onError: (err) => toastApiError(err, "Unable to assign permissions"),
  });
}
