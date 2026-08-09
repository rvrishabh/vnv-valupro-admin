export interface Branch {
  id: string;
  institutionId: string;
  institution?: { id: string; name: string; code: string };
  branchName: string;
  ifscCode?: string | null;
  city: string;
  state: string;
  district?: string | null;
  address?: string | null;
  isManuallyEntered: boolean;
  needsVerification: boolean;
  verifiedAt?: string | null;
  verifiedById?: string | null;
  createdAt: string;
}

export interface CreateManualBranchPayload {
  institutionId: string;
  branchName: string;
  city: string;
  state: string;
  district?: string;
  address?: string;
}

export interface UpdateBranchPayload extends Partial<CreateManualBranchPayload> {
  ifscCode?: string;
}

export interface ListBranchesQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  institutionId?: string;
  city?: string;
  needsVerification?: boolean;
  isManuallyEntered?: boolean;
}
