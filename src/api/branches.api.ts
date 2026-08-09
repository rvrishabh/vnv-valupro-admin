import { apiClient } from "@/lib/api-client";
import type { PaginatedResult } from "@/types/api.types";
import type {
  Branch,
  CreateManualBranchPayload,
  ListBranchesQuery,
  UpdateBranchPayload,
} from "@/types/branch.types";

export const branchesApi = {
  list: (query: ListBranchesQuery) =>
    apiClient.get<PaginatedResult<Branch>>("/branches", { ...query }),
  verificationQueue: () =>
    apiClient.get<Branch[]>("/branches/verification-queue"),
  createManual: (data: CreateManualBranchPayload) =>
    apiClient.post<Branch>("/branches/manual", data),
  update: (id: string, data: UpdateBranchPayload) =>
    apiClient.patch<Branch>(`/branches/${id}`, data),
  verify: (id: string) => apiClient.patch<Branch>(`/branches/${id}/verify`),
  reject: (id: string) => apiClient.delete<void>(`/branches/${id}`),
};
