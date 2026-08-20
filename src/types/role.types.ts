import type {
  assignPermissionsPayloadSchema,
  createRolePayloadSchema,
  updateRolePayloadSchema,
} from "@/schemas/role.schema";
import type { Permission } from "@/types/permission.types";
import type { LoginChannel } from "@/types/user.types";
import type { z } from "zod";

export interface RolePermission {
  id: string;
  permission: Permission;
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  loginChannel: LoginChannel;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  rolePermissions?: RolePermission[];
}

export type CreateRolePayload = z.infer<typeof createRolePayloadSchema>;
export type UpdateRolePayload = z.infer<typeof updateRolePayloadSchema>;
export type AssignPermissionsPayload = z.infer<
  typeof assignPermissionsPayloadSchema
>;

export interface ListRolesQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  loginChannel?: LoginChannel;
  isSystem?: boolean;
}
