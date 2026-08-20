import { api } from "@/lib/axios";
import type { ListValuationsQuery, PaginatedResult, Valuation } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { valuationQueryKeys } from "./valuationQueryKeys";

export function useValuationsQuery(query: ListValuationsQuery) {
  return useQuery({
    queryKey: valuationQueryKeys.list(query),
    queryFn: async () => {
      const response = await api.get<PaginatedResult<Valuation>>("/valuations", {
        params: query,
      });
      return response.data;
    },
  });
}
