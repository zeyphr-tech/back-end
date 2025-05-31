import { Transaction } from "ethers";
import {z} from "zod";  


export const machineSchema = z.object({
  to: z.string(),
  amount: z.string(),
  txId: z.string().optional(),
  password: z.string(),
  paymentMethod: z.string(),
  currency: z.string()
});

export const machineScannerSchema = z.object({
  id:z.string().uuid()
});