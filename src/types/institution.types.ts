export interface InstitutionType {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
}

export interface CreateInstitutionTypePayload {
  name: string;
  description?: string;
}

export type UpdateInstitutionTypePayload = Partial<CreateInstitutionTypePayload>;

export interface Institution {
  id: string;
  name: string;
  code: string;
  institutionTypeId: string;
  institutionType?: InstitutionType;
  isActive: boolean;
  createdAt: string;
}

export interface CreateInstitutionPayload {
  name: string;
  code: string;
  institutionTypeId: string;
}

export interface UpdateInstitutionPayload extends Partial<CreateInstitutionPayload> {
  isActive?: boolean;
}

export interface ListInstitutionsQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  institutionTypeId?: string;
  isActive?: boolean;
}
