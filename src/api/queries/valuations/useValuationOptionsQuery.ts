import { api } from "@/lib/axios";
import type { ValuationOptions } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { valuationQueryKeys } from "./valuationQueryKeys";

/** Dropdown master data; static enough to cache for the session. */
export function useValuationOptionsQuery() {
  return useQuery({
    queryKey: valuationQueryKeys.options(),
    queryFn: async () => {
      const response = await api.get<ValuationOptions>("/valuations/options");
      return response.data;
    },
    staleTime: 30 * 60 * 1000,
  });
}
