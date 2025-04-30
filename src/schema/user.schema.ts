import { z } from "zod";

export const userSchema = z.object({
  emailAddress: z.string().email(),
  password: z.string().min(6),
});
