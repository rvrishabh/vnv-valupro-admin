import type {
  createUserPayloadSchema,
  updateUserBranchPayloadSchema,
  updateUserPayloadSchema,
  userCreateFormSchema,
  userEditFormSchema,
} from "@/schemas/user.schema";
import type { z } from "zod";

export const LoginChannel = {
  WEB: "WEB",
  MOBILE: "MOBILE",
} as const;
export type LoginChannel = (typeof LoginChannel)[keyof typeof LoginChannel];

export const AuthMethod = {
  PASSWORD: "PASSWORD",
  EMAIL_OTP: "EMAIL_OTP",
  GOOGLE: "GOOGLE",
} as const;
export type AuthMethod = (typeof AuthMethod)[keyof typeof AuthMethod];

export interface UserRole {
  id: string;
  name: string;
  loginChannel: LoginChannel;
  isSystem: boolean;
}

export interface UserInstitutionType {
  id: string;
  name: string;
}

export interface UserInstitution {
  id: string;
  name: string;
  code: string;
  institutionType?: UserInstitutionType;
}

export interface UserBranch {
  id: string;
  branchName: string;
  city: string;
  state: string;
  needsVerification: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string | null;
  roleId: string;
  role?: UserRole;
  isActive: boolean;
  isApproved: boolean;
  institutionId?: string | null;
  institution?: UserInstitution | null;
  branchId?: string | null;
  branch?: UserBranch | null;
  authMethod?: AuthMethod | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateUserPayload = z.infer<typeof createUserPayloadSchema>;
export type UpdateUserPayload = z.infer<typeof updateUserPayloadSchema>;
export type UpdateUserBranchPayload = z.infer<
  typeof updateUserBranchPayloadSchema
>;
export type UserCreateFormValues = z.infer<typeof userCreateFormSchema>;
export type UserEditFormValues = z.infer<typeof userEditFormSchema>;

export interface ListUsersQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  isApproved?: boolean;
  isActive?: boolean;
  roleId?: string;
  loginChannel?: LoginChannel;
}
