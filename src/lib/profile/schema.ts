import { z } from "zod";
import { EDUCATION_LEVELS } from "@/lib/taxonomy";

/** Treat blank form fields as "not provided". */
const blankToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const currentYear = new Date().getFullYear();

export const profileSchema = z.object({
  fullName: z
    .string({ error: "Please enter your name." })
    .trim()
    .min(2, { error: "Please enter your name (at least 2 characters)." })
    .max(100, { error: "Name must be 100 characters or fewer." }),
  email: z.preprocess(
    blankToUndefined,
    z
      .email({ error: "Please enter a valid email address, or leave it blank." })
      .max(254)
      .transform((v) => v.toLowerCase())
      .optional(),
  ),
  college: z.preprocess(
    blankToUndefined,
    z.string().trim().max(150, { error: "College name must be 150 characters or fewer." }).optional(),
  ),
  educationLevel: z.enum(EDUCATION_LEVELS, { error: "Please choose your level of education." }),
  degreeSlug: z.string({ error: "Please choose your degree." }).trim().min(1, { error: "Please choose your degree." }),
  graduationYear: z.preprocess(
    blankToUndefined,
    z.coerce
      .number({ error: "Please enter a year like 2026." })
      .int({ error: "Please enter a year like 2026." })
      .min(currentYear - 40, { error: "That year looks too far in the past." })
      .max(currentYear + 8, { error: "That year looks too far in the future." })
      .optional(),
  ),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export type ProfileField = keyof ProfileInput;

export type ProfileFormState = {
  errors?: Partial<Record<ProfileField | "_form", string>>;
  /** Echo of the submitted values so the form keeps them after an error. */
  values?: Partial<Record<ProfileField, string>>;
};
