import { api } from "@/lib/axios";
import type { Case, ListCasesQuery, PaginatedResult } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const caseQueryKeys = {
  all: ["cases"] as const,
  lists: () => [...caseQueryKeys.all, "list"] as const,
  list: (query: ListCasesQuery) => [...caseQueryKeys.lists(), query] as const,
};

export function useCasesQuery(query: ListCasesQuery = {}) {
  return useQuery({
    queryKey: caseQueryKeys.list(query),
    queryFn: async () => {
      const response = await api.get<PaginatedResult<Case>>("/cases", {
        params: query,
      });
      return response.data;
    },
  });
}
