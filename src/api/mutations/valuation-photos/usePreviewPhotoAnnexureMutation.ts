import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import { useMutation } from "@tanstack/react-query";

/**
 * Fetches the annexure as a blob and hands back an object URL for an inline
 * preview — the caller decides when to revoke it (on modal close/unmount),
 * since it's also reused as the href for the in-modal download button.
 */
export function usePreviewPhotoAnnexureMutation() {
  return useMutation({
    mutationFn: async ({ id, filename }: { id: string; filename?: string }) => {
      const response = await api.get<Blob>(`/valuations/${id}/photos/annexure/pdf`, {
        responseType: "blob",
      });

      return {
        url: URL.createObjectURL(response.data),
        filename: filename ?? `photo-annexure-${id}.pdf`,
      };
    },
    onError: (err) => toastApiError(err, "Unable to load the photo annexure preview"),
  });
}
