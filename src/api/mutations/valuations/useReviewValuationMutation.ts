import { valuationQueryKeys } from "@/api/queries/valuations";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import {
  reviewValuationPayloadSchema,
  type ReviewValuationPayload,
} from "@/schemas/valuation.schema";
import type { Valuation } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useReviewValuationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: ReviewValuationPayload;
    }) => {
      const parsed = reviewValuationPayloadSchema.parse(data);
      const response = await api.post<Valuation>(`/valuations/${id}/review`, parsed);
      return response.data;
    },
    onSuccess: (valuation, { id }) => {
      toast.success(
        valuation.status === "APPROVED" ? "Valuation approved" : "Valuation rejected",
      );
      queryClient.invalidateQueries({ queryKey: valuationQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: valuationQueryKeys.lists() });
    },
    onError: (err) => toastApiError(err, "Unable to record the review"),
  });
}
