import { api } from "@/lib/axios";
import type { TehsilCircleRateUplift } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { circleRateUpliftQueryKeys } from "./circleRateUpliftQueryKeys";

/** GET /circle-rate-uplift returns a plain array — one row per overridden tehsil, nothing to paginate. */
export function useCircleRateUpliftQuery() {
  return useQuery({
    queryKey: circleRateUpliftQueryKeys.lists(),
    queryFn: async () => {
      const response = await api.get<TehsilCircleRateUplift[]>(
        "/circle-rate-uplift",
      );
      return response.data;
    },
  });
}
