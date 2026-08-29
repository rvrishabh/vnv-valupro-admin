import type { ListValuationsQuery } from "@/types";

export const valuationQueryKeys = {
  all: ["valuations"] as const,
  lists: () => [...valuationQueryKeys.all, "list"] as const,
  list: (query: ListValuationsQuery) =>
    [...valuationQueryKeys.lists(), query] as const,
  detail: (id: string) => [...valuationQueryKeys.all, "detail", id] as const,
  preview: (id: string) => [...valuationQueryKeys.all, "preview", id] as const,
  options: () => [...valuationQueryKeys.all, "options"] as const,
  circleRateSuggestion: (params: {
    tehsil: string;
    mohalla: string;
    roadWidthMeters: number;
    method: string;
  }) => [...valuationQueryKeys.all, "circle-rate-suggestion", params] as const,
};
