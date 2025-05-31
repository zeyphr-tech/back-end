import { Request, Response } from "express";
import { v4 as uuidV4 } from "uuid";
import bcrypt from "bcryptjs";
import {
  transactionSchema,
  bulkTransactionSchema,
  getTransactionByIdSchema,
  updateTransactionSchema,
  deleteTransactionSchema,
} from "../schema/transaction.schema";
import { bulkBuyItems, transferEther } from "../services/transfer.service";
import {
  fetchUserByPubKey,
  createTransaction,
  updateTransaction,
  getTransactionByID,
  getTransactionByPublicKey,
  deleteTransactionByID,
} from "../config/db";
import { decryptPrivateKey } from "../services/crypto.service";
import { handleCustomError } from "../utils/error.util";

type transactionStatus =
  | "pending"
  | "success"
  | "failure"

export const newTransaction = async (req: Request, res: Response) :Promise<any> => {
  try {
    const validatedData = transactionSchema.parse(req.body);
    const { publicKey } = req.user!;

    const user = await fetchUserByPubKey(publicKey);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.passwordHash
    );
    if (!isPasswordValid)
      return res.status(401).json({ error: "Invalid credentials" });

    const privateKey = decryptPrivateKey(
      user.pwdEncryptedPrivateKey,
      validatedData.password
    );

    let tx: any;
    let status: transactionStatus = "success";
    let errorMessage = "";
    let errorObj;

    try {
      tx = await transferEther(
        validatedData.to,
        validatedData.amount.toString(),
        privateKey
      );
    } catch (err: any) {
      status = "failure";
      errorMessage = err.message;
      errorObj = err;
    }

    const txId = validatedData.txId || uuidV4();
    await updateTransaction(txId, {
      id: txId,
      status,
      to: validatedData.to,
      from: publicKey,
      amount: validatedData.amount,
      paymentMethod: validatedData.paymentMethod,
      currency: validatedData.currency,
      errorMessage,
      txHash: tx?.hash || txId,
    });

    if (status === "failure") {
      const customError = handleCustomError(errorObj);
      return res.status(500).json({ message: customError.message });
    }

    return res.status(200).json({
      userName: user.username,
      userEmail: user.emailAddress,
      userPublicKey: user.publicKey,
      amount: validatedData.amount,
      txHash: tx.hash,
      message: "Transaction successful",
    });
  } catch (err: any) {
    const customError = handleCustomError(err);
    return res
      .status(customError.statusCode)
      .json({ message: customError.message });
  }
};

export const newBulkTransaction = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const validatedData = bulkTransactionSchema.parse(req.body);
    const { publicKey } = req.user!;

    const user = await fetchUserByPubKey(publicKey);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.passwordHash
    );
    if (!isPasswordValid)
      return res.status(401).json({ error: "Invalid credentials" });

    const privateKey = decryptPrivateKey(
      user.pwdEncryptedPrivateKey,
      validatedData.password
    );

    let tx: any;
    let status: transactionStatus = "success";
    let errorMessage = "";
    let errorObj;

    try {
      tx = await bulkBuyItems(validatedData.tokenIds, privateKey);
    } catch (err: any) {
      status = "failure";
      errorMessage = err.message;
      errorObj = err;
    }

    const id = uuidV4();
    await updateTransaction(id, {
      id,
      status,
      to: tx.to,
      from: publicKey,
      amount: validatedData.amount,
      paymentMethod: validatedData.paymentMethod,
      currency: validatedData.currency,
      errorMessage,
      txHash: tx?.hash || id,
    });

    if (status === "failure") {
      const customError = handleCustomError(errorObj);
      return res.status(500).json({ message: customError.message });
    }

    return res.status(200).json({
      userName: user.username,
      userEmail: user.emailAddress,
      userPublicKey: user.publicKey,
      amount: validatedData.amount,
      txHash: tx.hash,
      message: "Transaction successful",
    });
  } catch (err: any) {
    const customError = handleCustomError(err);
    return res
      .status(customError.statusCode)
      .json({ message: customError.message });
  }
};

export const getTransactionStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = getTransactionByIdSchema.parse(req.body);
    const tx = await getTransactionByID(id);
    if (!tx) return res.status(404).json({ error: "Transaction not found" });
    res.json(tx);
  } catch (err: any) {
    const customError = handleCustomError(err);
    return res
      .status(customError.statusCode)
      .json({ message: customError.message });
  }
};

export const getAllTransactionByUser = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { publicKey } = req.user!;
    const txList = await getTransactionByPublicKey(publicKey);

    const result = await Promise.all(
      txList.map(async (tx) => {
        if (!tx.from || !tx.to) {
          return tx;
        }
        const fromUser = await fetchUserByPubKey(tx.from);
        const toUser = await fetchUserByPubKey(tx.to);

        return {
          ...tx,
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

    return res.status(200).json(result);
  } catch (err: any) {
    const customError = handleCustomError(err);
    return res
      .status(customError.statusCode)
      .json({ message: customError.message });
  }
};

export const updateTransactionStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const validatedData = updateTransactionSchema.parse(req.body);
    const tx = await updateTransaction(validatedData.id, validatedData);

    if (!tx) return res.status(404).json({ error: "Transaction not found" });
    res.status(200).json(tx);
  } catch (err: any) {
    const customError = handleCustomError(err);
    return res
      .status(customError.statusCode)
      .json({ message: customError.message });
  }
};

export const deleteTransaction = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = deleteTransactionSchema.parse(req.body);
    const tx = await deleteTransactionByID(id);
    if (!tx) return res.status(404).json({ error: "Transaction not found" });
    res.json(tx);
  } catch (err: any) {
    const customError = handleCustomError(err);
    return res
      .status(customError.statusCode)
      .json({ message: customError.message });
  }
};
