import type {
  createInstitutionTypePayloadSchema,
  updateInstitutionTypePayloadSchema,
} from "@/schemas/institution-type.schema";
import type {
  createInstitutionPayloadSchema,
  updateInstitutionPayloadSchema,
} from "@/schemas/institution.schema";
import type { z } from "zod";

export interface InstitutionType {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
}

export type CreateInstitutionTypePayload = z.infer<
  typeof createInstitutionTypePayloadSchema
>;
export type UpdateInstitutionTypePayload = z.infer<
  typeof updateInstitutionTypePayloadSchema
>;

export interface Institution {
  id: string;
  name: string;
  code: string;
  institutionTypeId: string;
  institutionType?: InstitutionType;
  isActive: boolean;
  createdAt: string;
}

export type CreateInstitutionPayload = z.infer<
  typeof createInstitutionPayloadSchema
>;
export type UpdateInstitutionPayload = z.infer<
  typeof updateInstitutionPayloadSchema
>;

export interface ListInstitutionsQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  institutionTypeId?: string;
  isActive?: boolean;
}
