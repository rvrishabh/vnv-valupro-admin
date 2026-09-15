import { branchQueryKeys } from "@/api/queries/branches/branchQueryKeys";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import type { LookupIfscResult } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Resolves an IFSC code straight to a branch — the bank/institution and
 * branch (name, city, state, district, address) all come from the IFSC
 * registry, and the branch is created server-side in the same call. A
 * `found: false` result is a normal outcome (the code isn't in the
 * registry), not a request failure, so it does not reject the mutation.
 */
export function useLookupIfscMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ifscCode: string) => {
      const response = await api.post<LookupIfscResult>(
        "/branches/lookup-ifsc",
        { ifscCode },
      );
      return response.data;
    },
    onSuccess: (result) => {
      if (result.found) {
        toast.success(`${result.branch.branchName} added`);
        queryClient.invalidateQueries({ queryKey: branchQueryKeys.all });
      }
    },
    onError: (err) => toastApiError(err, "Unable to look up that IFSC code"),
  });
}
