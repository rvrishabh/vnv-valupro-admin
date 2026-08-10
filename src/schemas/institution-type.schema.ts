import { z } from "zod";

/** POST /institution-types */
export const createInstitutionTypePayloadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

/** PATCH /institution-types/:id */
export const updateInstitutionTypePayloadSchema =
  createInstitutionTypePayloadSchema.partial();
