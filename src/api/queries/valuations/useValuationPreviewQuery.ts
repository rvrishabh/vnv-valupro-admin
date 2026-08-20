import { api } from "@/lib/axios";
import type { ValuationResult } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { valuationQueryKeys } from "./valuationQueryKeys";

/**
 * Recomputes a draft server-side without persisting, so the form can show live
 * figures. Kept as a query (not a mutation) so it refetches when the saved
 * draft changes.
 */
export function useValuationPreviewQuery(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: valuationQueryKeys.preview(id ?? ""),
    queryFn: async () => {
      const response = await api.get<ValuationResult>(`/valuations/${id}/preview`);
      return response.data;
    },
    enabled: Boolean(id) && enabled,
    retry: false,
  });
}
