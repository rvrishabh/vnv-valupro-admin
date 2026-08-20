import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import { useMutation } from "@tanstack/react-query";

/**
 * The PDF endpoint streams bytes rather than the usual JSON envelope, so the
 * response is requested as a blob and saved via a temporary object URL.
 */
export function useDownloadValuationPdfMutation() {
  return useMutation({
    mutationFn: async ({ id, filename }: { id: string; filename?: string }) => {
      const response = await api.get<Blob>(`/valuations/${id}/pdf`, {
        responseType: "blob",
      });

      const url = URL.createObjectURL(response.data);
      try {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename ?? `valuation-${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      } finally {
        URL.revokeObjectURL(url);
      }
    },
    onError: (err) => toastApiError(err, "Unable to download the report"),
  });
}
