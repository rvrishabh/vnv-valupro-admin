import { z } from "zod";

/** POST /users */
export const createUserPayloadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  roleId: z.string().min(1, "Role is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  mobile: z.string().optional(),
});

/** PATCH /users/:id */
export const updateUserPayloadSchema = z.object({
  name: z.string().min(1).optional(),
  roleId: z.string().min(1).optional(),
  password: z.string().min(8).optional(),
  mobile: z.string().optional(),
  isActive: z.boolean().optional(),
});

/** PATCH /users/:id/branch */
export const updateUserBranchPayloadSchema = z.object({
  branchId: z.string().min(1, "Branch is required"),
});
