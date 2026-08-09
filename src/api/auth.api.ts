import { apiClient } from "@/lib/api-client";
import type { User } from "@/types/user.types";

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  login: (data: LoginPayload) =>
    apiClient.post<{ user: User }>("/auth/login", data),
  logout: () => apiClient.post<void>("/auth/logout"),
};
