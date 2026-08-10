import { branchQueryKeys } from "@/api/queries/branches/branchQueryKeys";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import { updateBranchPayloadSchema } from "@/schemas/branch.schema";
import type { Branch, UpdateBranchPayload } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateBranchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateBranchPayload;
    }) => {
      const parsed = updateBranchPayloadSchema.parse(data);
      const response = await api.patch<Branch>(`/branches/${id}`, parsed);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchQueryKeys.all });
    },
    onError: (err) => toastApiError(err, "Something went wrong"),
  });
}
