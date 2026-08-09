import { apiClient } from "@/lib/api-client";
import type { PaginatedResult } from "@/types/api.types";
import type {
  ListValuationEstimatesQuery,
  ValuationEstimate,
} from "@/types/valuation-estimate.types";

export const valuationEstimatesApi = {
  list: (query: ListValuationEstimatesQuery) =>
    apiClient.get<PaginatedResult<ValuationEstimate>>("/valuation-estimate", {
      ...query,
    }),
};
