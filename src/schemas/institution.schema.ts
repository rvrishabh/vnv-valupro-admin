import { z } from "zod";

/** POST /institutions */
export const createInstitutionPayloadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  institutionTypeId: z.string().min(1, "Institution type is required"),
});

/** PATCH /institutions/:id */
export const updateInstitutionPayloadSchema = createInstitutionPayloadSchema
  .partial()
  .extend({
    isActive: z.boolean().optional(),
  });

/** Institutions page create/edit form */
export const institutionFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  institutionTypeId: z.string().min(1, "Institution type is required"),
});
