import { valuationQueryKeys } from "@/api/queries/valuations";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import type { Valuation } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useSubmitValuationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post<Valuation>(`/valuations/${id}/submit`);
      return response.data;
    },
    onSuccess: (_, id) => {
      toast.success("Valuation submitted for review");
      queryClient.invalidateQueries({ queryKey: valuationQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: valuationQueryKeys.lists() });
    },
    onError: (err) => toastApiError(err, "Unable to submit the valuation"),
  });
}
