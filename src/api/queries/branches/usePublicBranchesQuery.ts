import { api } from "@/lib/axios";
import type { PublicBranch } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { branchQueryKeys } from "./branchQueryKeys";

/**
 * The verified branches for one institution, trimmed to what a picker needs.
 * Unguarded on the backend (the same endpoint the mobile app uses), so this
 * works for any signed-in role — not just admins — which the main
 * `/branches` listing is restricted to.
 */
export function usePublicBranchesQuery(institutionId: string) {
  return useQuery({
    queryKey: branchQueryKeys.public(institutionId),
    queryFn: async () => {
      const response = await api.get<PublicBranch[]>("/branches/public", {
        params: { institutionId },
      });
      return response.data;
    },
    enabled: Boolean(institutionId),
  });
}
