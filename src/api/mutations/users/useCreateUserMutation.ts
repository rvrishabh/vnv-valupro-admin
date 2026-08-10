import { userQueryKeys } from "@/api/queries/users/userQueryKeys";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import { createUserPayloadSchema } from "@/schemas/user.schema";
import type { CreateUserPayload, User } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateUserPayload) => {
      const parsed = createUserPayloadSchema.parse(payload);
      const response = await api.post<User>("/users", parsed);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Staff user created");
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
    onError: (err) => toastApiError(err, "Something went wrong"),
  });
}
