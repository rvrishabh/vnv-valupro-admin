import type { upsertTehsilUpliftPayloadSchema } from "@/schemas/circle-rate-uplift.schema";
import type { z } from "zod";

/** The only percentages the Settings page offers — see ALLOWED_UPLIFT_PERCENTS on the backend. */
export const UPLIFT_PERCENT_OPTIONS = [10, 20, 30, 40] as const;
export type UpliftPercentOption = (typeof UPLIFT_PERCENT_OPTIONS)[number];

/**
 * A per-(tehsil, plot position) override of the guideline circle rate's
 * positional uplift. A tehsil + position combination with no row here falls
 * back to the fixed default table — see
 * ValuationCalculator.circleRateUplift on the backend.
 */
export interface TehsilCircleRateUplift {
  id: string;
  tehsil: string;
  /** One of the report's plot-position values, e.g. "Park Facing". */
  plotPosition: string;
  /** A Prisma Decimal — arrives as a string over JSON, e.g. "30.00". */
  upliftPercent: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UpsertTehsilUpliftPayload = z.infer<
  typeof upsertTehsilUpliftPayloadSchema
>;

/** GET /circle-rate-uplift/resolve/:tehsil — active overrides for one tehsil, keyed by plot position. */
export interface TehsilUpliftResolution {
  tehsil: string;
  overrides: Record<string, number>;
}
