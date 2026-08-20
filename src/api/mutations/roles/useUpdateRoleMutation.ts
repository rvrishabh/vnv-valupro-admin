import { roleQueryKeys } from "@/api/queries/roles/roleQueryKeys";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import { updateRolePayloadSchema } from "@/schemas/role.schema";
import type { Role, UpdateRolePayload } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateRolePayload;
    }) => {
      const parsed = updateRolePayloadSchema.parse(data);
      const response = await api.patch<Role>(`/roles/${id}`, parsed);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Role updated");
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.all });
    },
    onError: (err) => toastApiError(err, "Something went wrong"),
  });
}
