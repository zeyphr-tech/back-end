import { Request, Response } from "express";
import { v4 as uuidV4 } from "uuid";
import { machineSchema } from "../schema/machine.schema";
import bcrypt from "bcryptjs";
import {
  deleteTransactionByID,
  getTransactionByID,
  getTransactionByPublicKey,
  updateTransaction,
} from "../config/db";

import { fetchUserByPubKey } from "../config/db";
import { handleCustomError } from "../utils/error.util";
import { decryptPrivateKey } from "../services/crypto.service";
import { transferHBAR } from "../hedera";
import { buyNFT } from "../hedera/buyNft";

export const newTransaction = async (req: any, res: Response): Promise<any> => {
  try {
    const validatedData = machineSchema.parse(req.body);
    const { publicKey, _id } = req.user;
    if (!validatedData) {
      return res.status(400).json({ error: "Invalid data" });
    }

    const { to, amount, password, paymentMethod, currency } = validatedData;

    const user = await fetchUserByPubKey(publicKey);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const decryptedPrivateKey = decryptPrivateKey(
      user.pwdEncryptedPrivateKey,
      password
    );

    let tx;
    let transactionStatus = "success";
    let errorMessage = "";
    let err;

    try {
      tx = await transferHBAR(publicKey, to, Number(amount), decryptedPrivateKey);
      if (!tx.isTxSuccess) {
        throw new Error("Transaction failed");
      }
    } catch (error: any) {
      transactionStatus = "failure";
      err = error;
      errorMessage = error.message;
    }
    let id = validatedData.txId || uuidV4();
    const updateTransaction_data: any = {
      status: transactionStatus,
      paymentMethod,
      to,
      amount,
      currency,
      errorMessage,
      from: publicKey, // user publickey  is taken from token
      txHash: tx?.txId || id,
    };

    await updateTransaction(id, updateTransaction_data);

    if (transactionStatus === "failure") {
      const customError = handleCustomError(err);
      return res.status(500).json({ message: customError.message });
    }

    return res.status(200).json({
      userName: user.username,
      userEmail: user.emailAddress,
      userPublicKey: user.publicKey,
      amount,
      txHash: tx?.txId,
      message: "Transaction successful",
    });
  } catch (err: any) {
    console.error("Transaction failed:", err);
    const customError = handleCustomError(err);
    return res.status(customError.statusCode).json({
      message: customError.message,
    });
  }
};

export const newBulkTransaction = async (req: any, res: Response): Promise<any> => {
  try {
    const { tokenIds, password, amount, paymentMethod, currency } = req.body;
    const { publicKey } = req.user;

    const user = await fetchUserByPubKey(publicKey);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const decryptedPrivateKey = decryptPrivateKey(user.pwdEncryptedPrivateKey, password);

    const results: any[] = [];

    for (const serial of tokenIds) {
      let tx: any;
      let status = "success";
      let errorMessage = "";
      let txHash = "";

      try {
        tx = await buyNFT(
          process.env.NFT_COLLECTION as string,
          serial,
          publicKey,
          decryptedPrivateKey
        );

        txHash = tx?.txHash || uuidV4();
      } catch (error: any) {
        status = "failure";
        errorMessage = error.message;
        txHash = uuidV4(); // fallback if tx failed
      }

      const transactionRecord = {
        id: uuidV4(),
        status,
        paymentMethod,
        to: "",
        amount,
        currency,
        errorMessage,
        from:"",
        txHash,
        tokenId: serial,
      };

      if(status === "success") {
        transactionRecord.from = tx.from || null;
        transactionRecord.to = tx?.to || null ;
      }


      await updateTransaction(uuidV4(), transactionRecord);

      // Push into results array for response
      results.push({
        tokenId: serial,
        status,
        txHash,
        errorMessage,
      });
    }

    return res.status(200).json({
      userName: user.username,
      userEmail: user.emailAddress,
      userPublicKey: user.publicKey,
      amount,
      results, // list of per-item transaction outcomes
      message: "Bulk transaction processed",
    });
  } catch (err: any) {
    console.error("Transaction failed:", err);
    const customError = handleCustomError(err);
    return res.status(customError.statusCode).json({
      message: customError.message,
    });
  }
};


// Retrieve transaction status by transactionID
export const getTransactionStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.body;
  try {
    const tx = await getTransactionByID(id);
    if (!tx) return res.status(404).json({ error: "Transaction not found" });

    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: "Error fetching transaction" });
  }
};

export const getAllTransactionByUser = async (
  req: any,
  res: Response
): Promise<any> => {
  const { publicKey } = req.user;

  try {
    if (!publicKey || typeof publicKey !== "string") {
      return res.status(400).json({ message: "Invalid search query." });
    }

    const txList = await getTransactionByPublicKey(publicKey);

    if (!txList || txList.length === 0) {
      return res.status(200).json([]);
    }

    const customData = await Promise.all(
      txList.map(async (tx: any) => {
        const fromUser = await fetchUserByPubKey(tx.from);
        const toUser = await fetchUserByPubKey(tx.to);

        return {
          id: tx.id,
          status: tx.status,
          paymentMethod: tx.paymentMethod,
          amount: tx.amount,
          currency: tx.currency,
          txHash: tx.txHash,
          errorMessage: tx.errorMessage,
          createdAt: tx.createdAt,
          from: fromUser
            ? {
                username: fromUser.username,
                emailAddress: fromUser.emailAddress,
                publicKey: fromUser.publicKey,
              }
            : tx.from,
          to: toUser
            ? {
                username: toUser.username,
                emailAddress: toUser.emailAddress,
                publicKey: toUser.publicKey,
              }
            : tx.to,
        };
      })
    );

    res.status(200).json(customData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching transaction" });
  }
};

// Update the status and timestamp of a transaction

export const updateTransactionStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id, status } = req.body;

  if (!id || !status) {
    return res
      .status(400)
      .json({ error: "transactionID and status are required" });
  }

  try {
    const tx = await updateTransaction(id, { ...req.body });
    if (!tx) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.status(200).json(tx);
  } catch (err) {
    console.error("Error updating transaction:", err);
    res.status(500).json({ error: "Failed to update transaction" });
  }
};

export const deleteTransaction = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.body;
  try {
    const tx = await deleteTransactionByID(id);
    if (!tx) return res.status(404).json({ error: "Transaction not found" });
    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete transaction" });
  }
};
