import { valuationQueryKeys } from "@/api/queries/valuations";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import {
  upsertValuationPayloadSchema,
  type UpsertValuationPayload,
} from "@/schemas/valuation.schema";
import type { Valuation } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateValuationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpsertValuationPayload;
    }) => {
      const parsed = upsertValuationPayloadSchema.parse(data);
      const response = await api.patch<Valuation>(`/valuations/${id}`, parsed);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      toast.success("Draft saved");
      queryClient.invalidateQueries({ queryKey: valuationQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: valuationQueryKeys.preview(id) });
      queryClient.invalidateQueries({ queryKey: valuationQueryKeys.lists() });
    },
    onError: (err) => toastApiError(err, "Unable to save the draft"),
  });
}
