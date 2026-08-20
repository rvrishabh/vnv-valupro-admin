import { api } from "@/lib/axios";
import type { Role } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { roleQueryKeys } from "./roleQueryKeys";

export function useRoleQuery(id: string | undefined) {
  return useQuery({
    queryKey: roleQueryKeys.detail(id ?? ""),
    queryFn: async () => {
      const response = await api.get<Role>(`/roles/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}
