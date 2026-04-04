import { z } from "zod";

export const RegisterWorkerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
  zone: z.enum(["Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "Marathahalli", "BTM Layout"]),
  platforms: z
    .array(z.enum(["Blinkit", "Zepto", "Swiggy Instamart", "BigBasket Now", "Amazon"]))
    .min(1, "Select at least one platform"),
  weeklyEarnings: z.number().min(500, "Weekly earnings must be at least Rs. 500").max(50000),
  hoursPerWeek: z.number().min(10, "Must work at least 10 hours/week").max(84),
});

export const SendOtpSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
});

export const VerifyOtpSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const CreatePolicySchema = z.object({
  workerId: z.string().min(1),
});

export const EvaluateClaimsSchema = z.object({
  workerId: z.string().min(1),
  simulatedTrigger: z
    .enum(["Rainfall", "AQI", "Zone Shutdown", "Demand Collapse", "Extreme Heat"])
    .optional(),
});

export const VerifyPaymentSchema = z.object({
  policyId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
}
