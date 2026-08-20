import type { ListRolesQuery } from "@/types";

export const roleQueryKeys = {
  all: ["roles"] as const,
  lists: () => [...roleQueryKeys.all, "list"] as const,
  list: (query: ListRolesQuery) => [...roleQueryKeys.lists(), query] as const,
  details: () => [...roleQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...roleQueryKeys.details(), id] as const,
};
