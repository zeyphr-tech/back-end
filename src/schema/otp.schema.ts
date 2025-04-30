import { z } from "zod";

export const otpSchema = z.object({
  emailAddress: z.string().email({ message: "Invalid email address" }),
});

export const otpValidateSchema = z.object({
  uid: z.string().uuid(),
  otp: z.string().length(6),
});
