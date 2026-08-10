import type { FindQueryParams } from "@/types";

export const institutionTypeQueryKeys = {
  all: ["institution-types"] as const,
  lists: () => [...institutionTypeQueryKeys.all, "list"] as const,
  list: (query: FindQueryParams) =>
    [...institutionTypeQueryKeys.lists(), query] as const,
};
