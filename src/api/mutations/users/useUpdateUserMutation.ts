import { userQueryKeys } from "@/api/queries/users/userQueryKeys";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import { updateUserPayloadSchema } from "@/schemas/user.schema";
import type { UpdateUserPayload, User } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateUserPayload;
    }) => {
      const parsed = updateUserPayloadSchema.parse(data);
      const response = await api.patch<User>(`/users/${id}`, parsed);
      return response.data;
    },
    onSuccess: () => {
      toast.success("User updated");
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
    onError: (err) => toastApiError(err, "Something went wrong"),
  });
}
