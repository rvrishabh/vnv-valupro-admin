import { api } from "@/lib/axios";
import type { ListRolesQuery, PaginatedResult, Role } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { roleQueryKeys } from "./roleQueryKeys";

export function useRolesQuery(query: ListRolesQuery) {
  return useQuery({
    queryKey: roleQueryKeys.list(query),
    queryFn: async () => {
      const response = await api.get<PaginatedResult<Role>>("/roles", {
        params: query,
      });
      return response.data;
    },
  });
}
