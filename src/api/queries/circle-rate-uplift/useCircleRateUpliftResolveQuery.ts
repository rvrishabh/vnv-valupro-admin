import { api } from "@/lib/axios";
import type { TehsilUpliftResolution } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { circleRateUpliftQueryKeys } from "./circleRateUpliftQueryKeys";

/**
 * Active overrides for one tehsil, keyed by plot position — open to any
 * signed-in valuer (not just admins), so the report form can show the
 * effective uplift live as they pick a plot position.
 */
export function useCircleRateUpliftResolveQuery(tehsil: string) {
  return useQuery({
    queryKey: circleRateUpliftQueryKeys.resolve(tehsil),
    queryFn: async () => {
      const response = await api.get<TehsilUpliftResolution>(
        `/circle-rate-uplift/resolve/${encodeURIComponent(tehsil)}`,
      );
      return response.data;
    },
    enabled: Boolean(tehsil),
  });
}
