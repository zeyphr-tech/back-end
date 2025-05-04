import { v4 as uuidV4 } from "uuid";
import { createTransaction, fetchUserByPubKey, updateTransaction, updateUserById } from "../config/db";
import { decryptPrivateKey, encryptPrivateKey } from "../services/crypto.service";
import { Request, Response } from "express"; // Ensure you import these types
import bcrypt from "bcryptjs"; 
import { transferEther } from "../services/transfer.service";
import { handleCustomError } from "../utils/error.util";
import { updateUser } from "./user.controller";
import { sendEmail, sendOtpEmail } from "../utils/email";

export const initiateTransactionByScanner = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id, to, amount } = req.body;

  if (!to || !amount ) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const response = await createTransaction({
      to,
      from: "",
      amount,
      paymentMethod: "qr",
      currency: "IOTA",
      status: "pending",
      id,
    });

    res.status(201).json({
      message: "Transaction Initiated",
      id: response._id, // Optional: return ID or summary
    });
  } catch (err) {
    console.error("Transaction creation failed:", err);
    res.status(500).json({ error: "Failed to create transaction" });
  }
};

export const initiateTransactionByCard = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { from, amount, to } = req.body;
  try {
    let user :any = await fetchUserByPubKey(from);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    let decryptedPrivateKey = decryptPrivateKey(
      user.cardEncryptedPrivateKey,""
    );

    let tx: any;
    let transactionStatus = "success";
    let errorMessage = "";
    let err;

    try {
      tx = await transferEther(to, amount, decryptedPrivateKey);
    } catch (error: any) {
      transactionStatus = "failure";
      err = error;
      errorMessage = error.message;
    }
    const id = uuidV4();
    const updateTransaction_data: any = {
      status: transactionStatus,
      paymentMethod:"card",
      to,
      amount,
      currency:"IOTA",
      errorMessage,
      from,
      txHash: tx?.hash || id,
    };

    await updateTransaction(id, updateTransaction_data);

    
        if (transactionStatus === "failure") {
          const customError = handleCustomError(err);
          return res
            .status(500)
            .json({ message: customError.message });
        }

      return res.status(200).json({
        userName: user.username,
        userEmail: user.emailAddress,
        userPublicKey: user.publicKey,
        amount,
        txHash: tx.hash,
        message: "Transaction successful",
      });


    // Continue with your logic here
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create transaction" });
  }
};


export const enableTapandPay = async (
  req: any,
  res: Response
): Promise<any> => {
  const { password, billingAddress, enabled } = req.body;
  const { _id, publicKey } = req.user;

  try {
    let user: any = await fetchUserByPubKey(publicKey);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Password check only required for enabling
    if (enabled) {
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Decrypt and re-encrypt private key
      const decrypted = decryptPrivateKey(
        user.pwdEncryptedPrivateKey,
        password
      );
      const encryptedPrivateKeyString = encryptPrivateKey(decrypted, "");

      const dataToUpdate: any = {
        cardEncryptedPrivateKey: encryptedPrivateKeyString,
        card: "enabled",
        billingAddress
      };

      req.body = dataToUpdate;

      await updateUserById(user._id, dataToUpdate);
      await sendEmail(user.emailAddress, billingAddress);

      return res.status(200).json({ message: "Tap and Pay enabled" });
    }
    // Handle disabling
    else {
      const dataToUpdate: any = {
        card: "disabled",
        cardEncryptedPrivateKey: "",
      };

      req.body = dataToUpdate;

      await updateUserById(user._id, dataToUpdate);

      return res.status(200).json({ message: "Tap and Pay disabled" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process Tap and Pay request" });
  }
};
