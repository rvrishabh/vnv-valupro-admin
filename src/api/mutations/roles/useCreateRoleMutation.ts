import { roleQueryKeys } from "@/api/queries/roles/roleQueryKeys";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import { createRolePayloadSchema } from "@/schemas/role.schema";
import type { CreateRolePayload, Role } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateRolePayload) => {
      const parsed = createRolePayloadSchema.parse(payload);
      const response = await api.post<Role>("/roles", parsed);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Role created");
      queryClient.invalidateQueries({ queryKey: roleQueryKeys.all });
    },
    onError: (err) => toastApiError(err, "Something went wrong"),
  });
}
