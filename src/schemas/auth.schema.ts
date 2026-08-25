import { z } from "zod";

/** POST /auth/login */
export const loginPayloadSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

/** The admin sign-in form — same shape as the payload it posts. */
export const loginFormSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

/** Search params on /login — where to return to once signed in. */
export const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});
