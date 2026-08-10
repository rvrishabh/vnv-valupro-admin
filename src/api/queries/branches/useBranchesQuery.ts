import { api } from "@/lib/axios";
import type { Branch, ListBranchesQuery, PaginatedResult } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { branchQueryKeys } from "./branchQueryKeys";

export function useBranchesQuery(
  query: ListBranchesQuery,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: branchQueryKeys.list(query),
    queryFn: async () => {
      const response = await api.get<PaginatedResult<Branch>>("/branches", {
        params: query,
      });
      return response.data;
    },
    enabled: options?.enabled,
  });
}
