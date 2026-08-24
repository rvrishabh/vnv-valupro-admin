import { z } from "zod";

/** POST /cases */
export const createCasePayloadSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerMobile: z.string().regex(/^[0-9]{10}$/, "Enter a 10 digit mobile number"),
  institutionId: z.string().min(1, "Bank is required"),
  branchId: z.string().optional(),
  propertyType: z.enum(["RESIDENTIAL", "COMMERCIAL", "LAND", "INDUSTRIAL"]),
  propertyLocation: z.string().optional(),
  bankReference: z.string().optional(),
});

/** Case detail page search params — lets a link jump straight to a tab. */
export const caseDetailSearchSchema = z.object({
  tab: z.enum(["overview", "valuation"]).optional(),
});
