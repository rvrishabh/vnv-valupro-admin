import { valuationPhotoQueryKeys } from "@/api/queries/valuation-photos";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import type { PhotoSection, ValuationPhotoMeta } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UploadPhotosArgs {
  valuationId: string;
  section: PhotoSection;
  files: File[];
}

export function useUploadValuationPhotosMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ valuationId, section, files }: UploadPhotosArgs) => {
      const body = new FormData();
      files.forEach((file, index) => body.append(`file${index}`, file));

      const response = await api.post<ValuationPhotoMeta[]>(
        `/valuations/${valuationId}/photos`,
        body,
        { params: { section } },
      );
      return response.data;
    },
    onSuccess: (uploaded, { valuationId, section }) => {
      const SINGLE_IMAGE_MESSAGES: Partial<Record<PhotoSection, string>> = {
        GOOGLE_EARTH: "Google Earth image saved",
        CIRCLE_RATE: "Circle rate image saved",
      };
      toast.success(
        SINGLE_IMAGE_MESSAGES[section] ??
          `${uploaded.length} site photo${uploaded.length === 1 ? "" : "s"} uploaded`,
      );
      queryClient.invalidateQueries({
        queryKey: valuationPhotoQueryKeys.list(valuationId),
      });
    },
    onError: (err) => toastApiError(err, "Unable to upload the photo(s)"),
  });
}
