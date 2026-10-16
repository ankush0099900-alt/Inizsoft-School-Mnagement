import { z } from "zod";

export const subscriptionSchema = z.object({
  schoolId: z.string().min(1, "School is required"),
  planId: z.string().min(1, "Plan is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  status: z.enum(["ACTIVE", "TRIAL", "EXPIRED", "CANCELLED"]),
  amount: z.number().min(0, "Amount must be 0 or greater"),
  discount: z.number().min(0),
  tax: z.number().min(0),
  finalAmount: z.number().min(0),
});

export type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;
