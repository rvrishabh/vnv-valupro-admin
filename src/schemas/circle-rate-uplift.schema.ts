import { z } from "zod";

/** The only percentages Settings offers — mirrors ALLOWED_UPLIFT_PERCENTS on the backend. */
const UPLIFT_PERCENT = z.union([
  z.literal(10),
  z.literal(20),
  z.literal(30),
  z.literal(40),
]);

/** PUT /circle-rate-uplift — one row per (tehsil, plot position), upserted together. */
export const upsertTehsilUpliftPayloadSchema = z.object({
  tehsil: z.string().min(1, "Tehsil is required"),
  plotPosition: z.string().min(1, "Plot position is required"),
  upliftPercent: UPLIFT_PERCENT,
  isActive: z.boolean().optional(),
});

/** Circle Rate Uplift settings page create/edit form. */
export const tehsilUpliftFormSchema = z.object({
  tehsil: z.string().min(1, "Tehsil is required"),
  plotPosition: z.string().min(1, "Plot position is required"),
  upliftPercent: UPLIFT_PERCENT,
  isActive: z.boolean(),
});
