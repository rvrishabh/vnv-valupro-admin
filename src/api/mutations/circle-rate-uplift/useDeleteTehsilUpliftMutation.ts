import { circleRateUpliftQueryKeys } from "@/api/queries/circle-rate-uplift";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/** Reverts a tehsil to the default corner/park-facing uplift table. */
export function useDeleteTehsilUpliftMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/circle-rate-uplift/${id}`),
    onSuccess: () => {
      toast.success("Reverted to the default uplift");
      queryClient.invalidateQueries({ queryKey: circleRateUpliftQueryKeys.all });
    },
    onError: (err) => toastApiError(err, "Unable to revert"),
  });
}
