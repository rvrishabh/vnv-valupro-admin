import { api } from "@/lib/axios";
import type { Valuation } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { valuationQueryKeys } from "./valuationQueryKeys";

export function useValuationQuery(id: string | undefined) {
  return useQuery({
    queryKey: valuationQueryKeys.detail(id ?? ""),
    queryFn: async () => {
      const response = await api.get<Valuation>(`/valuations/${id}`);
      return response.data;
    },
    enabled: Boolean(id),
  });
}
