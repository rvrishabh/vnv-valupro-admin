import { valuationPhotoQueryKeys } from "@/api/queries/valuation-photos";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import type { ValuationPhotoMeta } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/** PATCH /valuations/:id/photos/:photoId — toggles whether a site-visit photo is in the report. */
export function useSetPhotoIncludedMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      valuationId,
      photoId,
      includeInReport,
    }: {
      valuationId: string;
      photoId: string;
      includeInReport: boolean;
    }) => {
      const response = await api.patch<ValuationPhotoMeta>(
        `/valuations/${valuationId}/photos/${photoId}`,
        { includeInReport },
      );
      return response.data;
    },
    onSuccess: (_, { valuationId }) => {
      queryClient.invalidateQueries({
        queryKey: valuationPhotoQueryKeys.list(valuationId),
      });
    },
    onError: (err) => toastApiError(err, "Unable to update the photo selection"),
  });
}
