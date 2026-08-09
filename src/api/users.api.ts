import { apiClient } from "@/lib/api-client";
import type { PaginatedResult } from "@/types/api.types";
import type {
  CreateUserPayload,
  ListUsersQuery,
  UpdateUserPayload,
  User,
} from "@/types/user.types";

export const usersApi = {
  list: (query: ListUsersQuery) =>
    apiClient.get<PaginatedResult<User>>("/users", { ...query }),
  get: (id: string) => apiClient.get<User>(`/users/${id}`),
  create: (data: CreateUserPayload) => apiClient.post<User>("/users", data),
  update: (id: string, data: UpdateUserPayload) =>
    apiClient.patch<User>(`/users/${id}`, data),
  approve: (id: string) => apiClient.patch<User>(`/users/${id}/approve`),
  deactivate: (id: string) => apiClient.patch<User>(`/users/${id}/deactivate`),
  updateBranch: (id: string, branchId: string) =>
    apiClient.patch<User>(`/users/${id}/branch`, { branchId }),
};
