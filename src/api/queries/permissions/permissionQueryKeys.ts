import type { ListPermissionsQuery } from "@/types";

export const permissionQueryKeys = {
  all: ["permissions"] as const,
  lists: () => [...permissionQueryKeys.all, "list"] as const,
  list: (query: ListPermissionsQuery) =>
    [...permissionQueryKeys.lists(), query] as const,
};
