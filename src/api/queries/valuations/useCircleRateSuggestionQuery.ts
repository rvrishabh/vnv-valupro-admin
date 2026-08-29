import { api } from "@/lib/axios";
import type { CircleRateSuggestion, ValuationMethod } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { valuationQueryKeys } from "./valuationQueryKeys";

interface CircleRateSuggestionParams {
  tehsil: string;
  mohalla: string;
  roadWidthMeters: number;
  method: ValuationMethod;
}

/**
 * The last circle rate a valuer recorded for this exact area, category and
 * road-width band — a starting point, not an authority. Only fires once all
 * four inputs are known; a null result just means nobody has entered one yet.
 */
export function useCircleRateSuggestionQuery(params: CircleRateSuggestionParams) {
  const enabled =
    Boolean(params.tehsil) && Boolean(params.mohalla) && params.roadWidthMeters > 0;

  return useQuery({
    queryKey: valuationQueryKeys.circleRateSuggestion(params),
    queryFn: async () => {
      const response = await api.get<CircleRateSuggestion | null>(
        "/valuations/circle-rate-suggestion",
        { params },
      );
      return response.data;
    },
    enabled,
    retry: false,
  });
}
