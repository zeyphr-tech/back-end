import { z } from "zod";

export const transactionSchema = z.object({
  to: z.string().min(1),
  amount: z.number().positive(),
  password: z.string().min(1),
  paymentMethod: z.enum(["card", "wallet", "qr"]),
  currency: z.string().min(1),
  txId: z.string().optional(),
});

export const bulkTransactionSchema = z.object({
  tokenIds: z.array(z.number()).nonempty(),
  password: z.string().min(1),
  amount: z.number().positive(),
  paymentMethod: z.enum(["card", "wallet", "qr"]),
  currency: z.string(),
});

export const getTransactionByIdSchema = z.object({
  id: z.string().uuid(),
});

export const updateTransactionSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["success", "failure", "pending"]),
});

export const deleteTransactionSchema = z.object({
  id: z.string().uuid(),
});
