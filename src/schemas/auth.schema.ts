import { z } from "zod";

/** POST /auth/login */
export const loginPayloadSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
