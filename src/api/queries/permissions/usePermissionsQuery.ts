import { api } from "@/lib/axios";
import type { ListPermissionsQuery, PaginatedResult, Permission } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { permissionQueryKeys } from "./permissionQueryKeys";

export function usePermissionsQuery(query: ListPermissionsQuery) {
  return useQuery({
    queryKey: permissionQueryKeys.list(query),
    queryFn: async () => {
      const response = await api.get<PaginatedResult<Permission>>(
        "/permissions",
        { params: query },
      );
      return response.data;
    },
  });
}
