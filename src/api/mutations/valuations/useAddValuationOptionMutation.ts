import { valuationQueryKeys } from "@/api/queries/valuations";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Records a locality a valuer typed into a dropdown so the next report offers
 * it. The register of tehsils and registration wards is open-ended — no
 * workbook covers every district — so the list grows from use.
 */
export function useAddValuationOptionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ group, value }: { group: string; value: string }) => {
      const response = await api.post<{ group: string; value: string }>(
        "/valuations/options",
        { group, value },
      );
      return response.data;
    },
    onSuccess: () => {
      // The dropdown reads from the options query, so it has to refetch for the
      // new value to appear as a listed choice rather than a typed one.
      queryClient.invalidateQueries({ queryKey: valuationQueryKeys.options() });
    },
    // Saving the option is a convenience, not the point of the edit — the typed
    // value is already in the form, so a failure here must not block the valuer.
    onError: (err) => toastApiError(err, "Saved for this report, but not to the list"),
  });
}
