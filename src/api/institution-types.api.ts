import { apiClient } from "@/lib/api-client";
import type { FindQueryParams } from "@/types/api.types";
import type {
  CreateInstitutionTypePayload,
  InstitutionType,
  UpdateInstitutionTypePayload,
} from "@/types/institution.types";

export const institutionTypesApi = {
  // Unlike other list endpoints, GET /institution-types returns a plain
  // array — the backend service intentionally discards pagination info
  // (src/modules/institution-types/institution-types.service.ts findAll).
  list: (query: FindQueryParams) =>
    apiClient.get<InstitutionType[]>("/institution-types", { ...query }),
  get: (id: string) =>
    apiClient.get<InstitutionType>(`/institution-types/${id}`),
  create: (data: CreateInstitutionTypePayload) =>
    apiClient.post<InstitutionType>("/institution-types", data),
  update: (id: string, data: UpdateInstitutionTypePayload) =>
    apiClient.patch<InstitutionType>(`/institution-types/${id}`, data),
  remove: (id: string) => apiClient.delete<void>(`/institution-types/${id}`),
};
