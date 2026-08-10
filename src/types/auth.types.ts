import type { loginPayloadSchema } from "@/schemas/auth.schema";
import type { z } from "zod";
import type { User } from "./user.types";

export type LoginPayload = z.infer<typeof loginPayloadSchema>;

export interface LoginResponse {
  user: User;
}
