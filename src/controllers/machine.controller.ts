import { Request, Response } from "express";
import { ethers } from "ethers";
import { transferEther } from "../services/transfer.service"; // adjust path if needed
import { machineSchema } from "../schema/machine.schema";
import { fetchUserByPubKey } from "../config/db";
import { handleCustomError } from "../utils/error.util";


export const newTransaction = async (req: Request, res: Response):Promise<any> => {
  try {
    const validatedData = machineSchema.parse(req.body);
    if (!validatedData) {
      return res.status(400).json({ error: "Invalid data" });
    }
    const { publicKey, privateKey, merchantPublicKey, amount } = validatedData;

    // Basic sanity check
    if (!ethers.isAddress(publicKey) || !ethers.isAddress(merchantPublicKey)) {
      return res.status(400).json({ error: "Invalid User" });
    }

    let user = await fetchUserByPubKey(publicKey);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Trigger transaction
    const tx = await transferEther(merchantPublicKey, amount, privateKey);

    let response = {
      userName: user.username,
      userEmail: user.emailAddress,
      userPublicKey: user.publicKey,
      amount: amount,
      txHash: tx.hash,
      message: "Transaction successful",
    };

    return res.status(200).json(response);
  } catch (err: any) {
    console.error("Transaction failed:", err);

    const customError = handleCustomError(err);

    return res.status(customError.statusCode).json({
      error: customError.message,
    });
  }
};
