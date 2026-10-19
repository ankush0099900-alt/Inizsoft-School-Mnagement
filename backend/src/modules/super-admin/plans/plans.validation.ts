import { z } from "zod";

export const planIdSchema = z.object({
  id: z.string().uuid("Invalid plan ID"),
});

export const planModuleParamsSchema = z.object({
  id: z.string().uuid("Invalid plan ID"),
  moduleId: z.string().uuid("Invalid module ID"),
});

export const createPlanSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Plan name must be at least 2 characters")
    .max(100),

  code: z
    .string()
    .trim()
    .min(2, "Plan code must be at least 2 characters")
    .max(50)
    .toUpperCase(),

  description: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable()
    .or(z.literal("")),

  price: z.coerce.number().min(0, "Price must be greater than or equal to 0"),

  currency: z.string().trim().min(1).max(10).default("INR"),

  durationInDays: z.coerce
    .number()
    .int()
    .positive("Duration must be a positive number of days"),

  maxStudents: z.coerce
    .number()
    .int()
    .min(0, "Max students must be 0 or more"),

  maxTeachers: z.coerce
    .number()
    .int()
    .min(0, "Max teachers must be 0 or more"),

  maxAdmins: z.coerce
    .number()
    .int()
    .min(1, "Max admins must be at least 1"),
});

export const updatePlanSchema = createPlanSchema.partial();

export const updatePlanStatusSchema = z.object({
  isActive: z.boolean(),
});

export const assignPlanModuleSchema = z.object({
  moduleId: z.string().uuid("Invalid module ID"),
});

export const bulkAssignPlanModulesSchema = z.object({
  moduleIds: z
    .array(z.string().uuid("Invalid module ID"))
    .min(1, "At least one module is required"),
});
