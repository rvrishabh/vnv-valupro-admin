import { caseQueryKeys } from "@/api/queries/cases";
import { api } from "@/lib/axios";
import { toastApiError } from "@/lib/query-utils";
import type { Case, PropertyType } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

export const createCasePayloadSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerMobile: z.string().regex(/^[0-9]{10}$/, "Enter a 10 digit mobile number"),
  institutionId: z.string().min(1, "Bank is required"),
  branchId: z.string().optional(),
  propertyType: z.enum(["RESIDENTIAL", "COMMERCIAL", "LAND", "INDUSTRIAL"]),
  propertyLocation: z.string().optional(),
  bankReference: z.string().optional(),
});

export type CreateCasePayload = {
  customerName: string;
  customerMobile: string;
  institutionId: string;
  branchId?: string;
  propertyType: PropertyType;
  propertyLocation?: string;
  bankReference?: string;
};

export function useCreateCaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCasePayload) => {
      const parsed = createCasePayloadSchema.parse(payload);
      const response = await api.post<Case>("/cases", parsed);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caseQueryKeys.all });
    },
    onError: (err) => toastApiError(err, "Unable to create the case"),
  });
}
