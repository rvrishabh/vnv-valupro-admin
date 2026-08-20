import { z } from "zod";

/** POST /roles */
export const createRolePayloadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  loginChannel: z.enum(["WEB", "MOBILE"]),
  isSystem: z.boolean().optional(),
});

/** PATCH /roles/:id */
export const updateRolePayloadSchema = createRolePayloadSchema.partial();

/** POST /roles/:id/permissions */
export const assignPermissionsPayloadSchema = z.object({
  permissionIds: z.array(z.string()),
});
