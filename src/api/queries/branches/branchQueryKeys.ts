import type { ListBranchesQuery } from "@/types";

export const branchQueryKeys = {
  all: ["branches"] as const,
  lists: () => [...branchQueryKeys.all, "list"] as const,
  list: (query: ListBranchesQuery) =>
    [...branchQueryKeys.lists(), query] as const,
  verificationQueue: () => [...branchQueryKeys.all, "verification-queue"] as const,
};
