import { circleRateUpliftQueryKeys } from "@/api/queries/circle-rate-uplift";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import { upsertTehsilUpliftPayloadSchema } from "@/schemas/circle-rate-uplift.schema";
import type { TehsilCircleRateUplift, UpsertTehsilUpliftPayload } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/** One row per tehsil — PUT upserts by tehsil name, so create and edit share this mutation. */
export function useUpsertTehsilUpliftMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpsertTehsilUpliftPayload) => {
      const parsed = upsertTehsilUpliftPayloadSchema.parse(payload);
      const response = await api.put<TehsilCircleRateUplift>(
        "/circle-rate-uplift",
        parsed,
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Circle rate uplift saved");
      queryClient.invalidateQueries({ queryKey: circleRateUpliftQueryKeys.all });
    },
    onError: (err) => toastApiError(err, "Something went wrong"),
  });
}
