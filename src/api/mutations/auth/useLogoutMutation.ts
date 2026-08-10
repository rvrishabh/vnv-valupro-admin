import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

export function useLogoutMutation() {
  return useMutation({
    mutationFn: () => api.post<void>("/auth/logout"),
  });
}
