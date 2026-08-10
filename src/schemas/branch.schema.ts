import { z } from "zod";

/** POST /branches/manual */
export const createManualBranchPayloadSchema = z.object({
  institutionId: z.string().min(1, "Institution is required"),
  branchName: z.string().min(1, "Branch name is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  district: z.string().optional(),
  address: z.string().optional(),
});

/** PATCH /branches/:id */
export const updateBranchPayloadSchema = createManualBranchPayloadSchema
  .partial()
  .extend({
    ifscCode: z.string().optional(),
  });
