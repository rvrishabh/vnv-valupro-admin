import { valuationPhotoQueryKeys } from "@/api/queries/valuation-photos";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteValuationPhotoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      valuationId,
      photoId,
    }: {
      valuationId: string;
      photoId: string;
    }) => {
      await api.delete(`/valuations/${valuationId}/photos/${photoId}`);
    },
    onSuccess: (_, { valuationId }) => {
      queryClient.invalidateQueries({
        queryKey: valuationPhotoQueryKeys.list(valuationId),
      });
    },
    onError: (err) => toastApiError(err, "Unable to delete the photo"),
  });
}
