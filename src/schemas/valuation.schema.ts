import { z } from "zod";

const ROOF_TYPES = ["RCC", "RBC", "Girder Stone", "Tin Shed", "Kachcha"] as const;

export const floorSchema = z.object({
  name: z.string().min(1, "Floor name is required"),
  coveredAreaSqM: z.coerce.number().min(0, "Area cannot be negative"),
  replacementRate: z.coerce.number().min(0, "Rate cannot be negative"),
  roofType: z.enum(ROOF_TYPES),
  constructionCategory: z.union([z.literal(1), z.literal(2)]).optional(),
  specs: z.record(z.string(), z.string()).optional(),
});

export const landSchema = z.object({
  prevailingMarketRate: z.coerce.number().min(0),
  circleRate: z.coerce.number().min(0),
  adoptedRate: z.coerce.number().min(0),
  plotPosition: z.string().min(1, "Plot position is required"),
  // Stored as a fraction: 0.15 means 15%.
  superAreaPercent: z.coerce.number().min(0).max(1).optional(),
});

export const buildingSchema = z.object({
  yearOfConstruction: z.coerce.number().int().min(1800).max(2200),
  expectedLifeYears: z.coerce.number().int().min(1).optional(),
  floors: z.array(floorSchema),
});

/** Every section is optional so a draft can be saved section by section. */
export const upsertValuationPayloadSchema = z.object({
  method: z.enum(["LAND_AND_BUILDING", "CRM", "PLOT"]).optional(),
  reportYear: z.coerce.number().int().optional(),
  tehsil: z.string().optional(),
  plotAreaSqM: z.coerce.number().min(0).optional(),
  land: landSchema.optional(),
  building: buildingSchema.optional(),
  titleDeed: z.record(z.string(), z.unknown()).optional(),
  boundaries: z.record(z.string(), z.unknown()).optional(),
  dimensions: z.record(z.string(), z.unknown()).optional(),
  buildingSpecs: z.record(z.string(), z.unknown()).optional(),
  generalDetails: z.record(z.string(), z.unknown()).optional(),
  extraItems: z.record(z.string(), z.union([z.number(), z.string()])).optional(),
  services: z.record(z.string(), z.union([z.number(), z.string()])).optional(),
  siteVisit: z.record(z.string(), z.unknown()).optional(),
  engineerNotes: z.string().optional(),
});

export const createValuationPayloadSchema = upsertValuationPayloadSchema.extend({
  caseId: z.string().min(1, "Case is required"),
});

export const reviewValuationPayloadSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  notes: z.string().optional(),
});

export type UpsertValuationPayload = z.infer<typeof upsertValuationPayloadSchema>;
export type CreateValuationPayload = z.infer<typeof createValuationPayloadSchema>;
export type ReviewValuationPayload = z.infer<typeof reviewValuationPayloadSchema>;
