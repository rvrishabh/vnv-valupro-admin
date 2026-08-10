import { api } from "@/lib/axios";
import type {
  ListValuationEstimatesQuery,
  PaginatedResult,
  ValuationEstimate,
} from "@/types";
import { useQuery } from "@tanstack/react-query";
import { valuationEstimateQueryKeys } from "./valuationEstimateQueryKeys";

export function useValuationEstimatesQuery(
  query: ListValuationEstimatesQuery,
) {
  return useQuery({
    queryKey: valuationEstimateQueryKeys.list(query),
    queryFn: async () => {
      const response = await api.get<PaginatedResult<ValuationEstimate>>(
        "/valuation-estimate",
        { params: query },
      );
      return response.data;
    },
  });
}
