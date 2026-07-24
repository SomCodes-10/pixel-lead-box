import { z } from "zod";

export const BUDGET_RANGES = ["<$1k", "$1k-$5k", "$5k-$20k", "$20k+"] as const;
export const LEAD_STATUSES = ["New", "Contacted", "Closed"] as const;

export type BudgetRange = (typeof BUDGET_RANGES)[number];
export type LeadStatus = (typeof LEAD_STATUSES)[number];

// Shared validation — used both client-side (form errors) and server-side (insert).
export const leadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(255),
  budget_range: z.enum(BUDGET_RANGES, {
    errorMap: () => ({ message: "Select a budget range" }),
  }),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message is too long"),
});

export type LeadInput = z.infer<typeof leadSchema>;

export interface Lead extends LeadInput {
  id: string;
  status: LeadStatus;
  created_at: string;
}
