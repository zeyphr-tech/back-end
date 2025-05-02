import { Request, Response } from "express";
import { ethers } from "ethers";
import { transferEther } from "../services/transfer.service"; // adjust path if needed
import { machineScannerSchema, machineSchema } from "../schema/machine.schema";
import {
  createTransaction,
  deleteTransactionByID,
  getTransactionByID,
  updateTransaction,
} from "../config/db";

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
      message: customError.message,
    });
  }
};

export const newTransactionByScan = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const validatedData = machineScannerSchema.parse(req.body);
    if (!validatedData) {
      return res.status(400).json({ error: "Invalid data" });
    }
    const { transactionID } = validatedData;

    
  } catch (err: any) {
    console.error("Transaction failed:", err);

    const customError = handleCustomError(err);

    return res.status(customError.statusCode).json({
      error: customError.message,
    });
  }
};

export const initiateTransaction = async (req: Request, res: Response) => {
  const { transactionID,amount,paymentMethod,currency } = req.body;
  try {
    const response = await createTransaction({amount,transactionID,paymentMethod,currency,status:"pending"});

    res.status(201).json({"message":"Transaction Initaed "});
  } catch (err) {
    res.status(500).json({ error: "Failed to create transaction" });
  }
};

// Retrieve transaction status by transactionID
export const getTransactionStatus = async (req: Request, res: Response):Promise<any> => {
  const { transactionID } = req.body;
  try {
    const tx = await getTransactionByID(transactionID);
    if (!tx) return res.status(404).json({ error: "Transaction not found" });

    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: "Error fetching transaction" });
  }
};

// Update the status and timestamp of a transaction

export const updateTransactionStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { transactionID, status } = req.body;

  if (!transactionID || !status) {
    return res
      .status(400)
      .json({ error: "transactionID and status are required" });
  }

  try {
    const tx = await updateTransaction(transactionID, { ...req.body });
    if (!tx) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.status(200).json(tx);
  } catch (err) {
    console.error("Error updating transaction:", err);
    res.status(500).json({ error: "Failed to update transaction" });
  }
};


export const deleteTransaction = async (req: Request, res: Response):Promise<any> => {
  const { transactionID } = req.body;
  try {
    const tx = await deleteTransactionByID(transactionID);
    if (!tx) return res.status(404).json({ error: "Transaction not found" });
    res.json(tx); 
  }
  catch (err) {
    res.status(500).json({ error: "Failed to delete transaction" });
  } 
}