import { branchQueryKeys } from "@/api/queries/branches/branchQueryKeys";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import { createManualBranchPayloadSchema } from "@/schemas/branch.schema";
import type { Branch, CreateManualBranchPayload } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateManualBranchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateManualBranchPayload) => {
      const parsed = createManualBranchPayloadSchema.parse(payload);
      const response = await api.post<Branch>("/branches/manual", parsed);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Branch created");
      queryClient.invalidateQueries({ queryKey: branchQueryKeys.all });
    },
    onError: (err) => toastApiError(err, "Something went wrong"),
  });
}
