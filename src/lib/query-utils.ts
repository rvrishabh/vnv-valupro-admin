import { ApiError } from "@/lib/axios";
import { toast } from "sonner";

export function toastApiError(err: unknown, fallback: string) {
  toast.error(err instanceof ApiError ? err.message : fallback);
}
