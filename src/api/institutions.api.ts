import { apiClient } from "@/lib/api-client";
import type { PaginatedResult } from "@/types/api.types";
import type {
  CreateInstitutionPayload,
  Institution,
  ListInstitutionsQuery,
  UpdateInstitutionPayload,
} from "@/types/institution.types";

export const institutionsApi = {
  list: (query: ListInstitutionsQuery) =>
    apiClient.get<PaginatedResult<Institution>>("/institutions", { ...query }),
  get: (id: string) => apiClient.get<Institution>(`/institutions/${id}`),
  create: (data: CreateInstitutionPayload) =>
    apiClient.post<Institution>("/institutions", data),
  update: (id: string, data: UpdateInstitutionPayload) =>
    apiClient.patch<Institution>(`/institutions/${id}`, data),
  remove: (id: string) => apiClient.delete<void>(`/institutions/${id}`),
};
