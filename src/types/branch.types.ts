import type {
  branchFormSchema,
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
export type BranchFormValues = z.infer<typeof branchFormSchema>;

/**
 * POST /branches/lookup-ifsc resolves the bank, creates its institution if
 * needed, and creates the branch in one step — `found: true` means it's
 * already in the database (whether it existed before or was just created).
 */
export type LookupIfscResult =
  | { found: true; branch: Branch }
  | { found: false; ifscCode: string; reason: "not_found" };

/** GET /branches/public?institutionId= — a verified branch, trimmed for a picker. */
export interface PublicBranch {
  id: string;
  branchName: string;
  city: string;
  state: string;
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
