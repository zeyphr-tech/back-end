import { Transaction } from "ethers";
import {z} from "zod";  


export const machineSchema = z.object({
  from: z.string(),
  to: z.string(),
  amount: z.string(),
  password: z.string(),
  paymentMethod: z.string(),
  currency: z.string()
});

export const machineScannerSchema = z.object({
  id:z.string().uuid()
});