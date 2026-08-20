import { valuationQueryKeys } from "@/api/queries/valuations";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import {
  createValuationPayloadSchema,
  type CreateValuationPayload,
} from "@/schemas/valuation.schema";
import type { Valuation } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateValuationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateValuationPayload) => {
      const parsed = createValuationPayloadSchema.parse(payload);
      const response = await api.post<Valuation>("/valuations", parsed);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Valuation draft created");
      queryClient.invalidateQueries({ queryKey: valuationQueryKeys.all });
    },
    onError: (err) => toastApiError(err, "Unable to create the valuation"),
  });
}
