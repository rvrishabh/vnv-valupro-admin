import type { ListValuationEstimatesQuery } from "@/types";

export const valuationEstimateQueryKeys = {
  all: ["valuation-estimates"] as const,
  lists: () => [...valuationEstimateQueryKeys.all, "list"] as const,
  list: (query: ListValuationEstimatesQuery) =>
    [...valuationEstimateQueryKeys.lists(), query] as const,
};
