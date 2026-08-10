import type { ListInstitutionsQuery } from "@/types";

export const institutionQueryKeys = {
  all: ["institutions"] as const,
  lists: () => [...institutionQueryKeys.all, "list"] as const,
  list: (query: ListInstitutionsQuery) =>
    [...institutionQueryKeys.lists(), query] as const,
};
