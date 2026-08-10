import { api } from "@/lib/axios";
import type { Branch } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { branchQueryKeys } from "./branchQueryKeys";

export function useBranchVerificationQueueQuery(options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: branchQueryKeys.verificationQueue(),
    queryFn: async () => {
      const response = await api.get<Branch[]>("/branches/verification-queue");
      return response.data;
    },
    enabled: options?.enabled,
  });
}
