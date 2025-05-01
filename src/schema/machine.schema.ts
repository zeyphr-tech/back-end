import {z} from "zod";  


export const machineSchema = z.object({
  publicKey: z.string(),
  privateKey: z.string(),
  merchantPublicKey: z.string(),
  amount: z.string(),
})