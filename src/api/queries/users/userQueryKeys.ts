import type { ListUsersQuery } from "@/types";

export const userQueryKeys = {
  all: ["users"] as const,
  lists: () => [...userQueryKeys.all, "list"] as const,
  list: (query: ListUsersQuery) => [...userQueryKeys.lists(), query] as const,
};
