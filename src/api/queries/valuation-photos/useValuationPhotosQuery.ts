import { api } from "@/lib/axios";
import type { ValuationPhotoMeta } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { valuationPhotoQueryKeys } from "./valuationPhotoQueryKeys";

/** Metadata only — thumbnails fetch their own bytes separately, as authenticated blobs. */
export function useValuationPhotosQuery(valuationId: string) {
  return useQuery({
    queryKey: valuationPhotoQueryKeys.list(valuationId),
    queryFn: async () => {
      const response = await api.get<ValuationPhotoMeta[]>(
        `/valuations/${valuationId}/photos`,
      );
      return response.data;
    },
    enabled: Boolean(valuationId),
  });
}
