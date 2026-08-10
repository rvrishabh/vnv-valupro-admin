import { api } from "@/lib/axios";
import type { ListUsersQuery, PaginatedResult, User } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { userQueryKeys } from "./userQueryKeys";

export function useUsersQuery(query: ListUsersQuery) {
  return useQuery({
    queryKey: userQueryKeys.list(query),
    queryFn: async () => {
      const response = await api.get<PaginatedResult<User>>("/users", {
        params: query,
      });
      return response.data;
    },
  });
}
