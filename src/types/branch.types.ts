import type {
  createManualBranchPayloadSchema,
  updateBranchPayloadSchema,
} from "@/schemas/branch.schema";
import type { z } from "zod";

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

export type CreateManualBranchPayload = z.infer<
  typeof createManualBranchPayloadSchema
>;
export type UpdateBranchPayload = z.infer<typeof updateBranchPayloadSchema>;

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
