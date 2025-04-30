import { z } from "zod";

export const updateSchema = z.object({
  dataToUpdate: z.object({}),
  email: z.string().email().optional(),
});
