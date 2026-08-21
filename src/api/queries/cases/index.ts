import { api } from "@/lib/axios";
import type { Case, CaseTimeline, ListCasesQuery, PaginatedResult } from "@/types";
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

export function useCaseQuery(id: string | undefined) {
  return useQuery({
    queryKey: [...caseQueryKeys.all, "detail", id] as const,
    queryFn: async () => {
      const response = await api.get<Case>(`/cases/${id}`);
      return response.data;
    },
    enabled: Boolean(id),
  });
}

export function useCaseTimelineQuery(id: string | undefined) {
  return useQuery({
    queryKey: [...caseQueryKeys.all, "timeline", id] as const,
    queryFn: async () => {
      const response = await api.get<CaseTimeline>(`/cases/${id}/timeline`);
      return response.data;
    },
    enabled: Boolean(id),
  });
}
