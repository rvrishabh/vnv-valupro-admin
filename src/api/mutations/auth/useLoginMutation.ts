import { api } from "@/lib/axios";
import { loginPayloadSchema } from "@/schemas/auth.schema";
import type { LoginPayload, LoginResponse } from "@/types";
import { useMutation } from "@tanstack/react-query";

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const parsed = loginPayloadSchema.parse(payload);
      const response = await api.post<LoginResponse>("/auth/login", parsed);
      return response.data;
    },
  });
}
