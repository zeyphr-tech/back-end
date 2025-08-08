import { User } from "../models/User";
import { Token } from "../models/Token";
import { OTP } from "../models/Otp";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Transaction from "../models/Transaction";
import { Nft } from "../models/Nft";

dotenv.config();
// Connect to the database
export const connectDb = async () => {
  try {
    const dbURI = process.env.MONGODB_URI;
    if (!dbURI) {
      throw new Error("Mongo URI is not provided in .env file");
    }
    await mongoose.connect(dbURI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process if DB connection fails
  }
};

export const saveUser = async ({
  username,
  emailAddress,
  passwordHash,
  publicKey,
  pwdEncryptedPrivateKey,
  billingAddress
}: {
  username: string;
  emailAddress: string;
  passwordHash: string;
  publicKey: string;
  pwdEncryptedPrivateKey: string;
  billingAddress:string
}) => {
  const newUser = new User({
    username,
    emailAddress,
    passwordHash,
    publicKey,
    pwdEncryptedPrivateKey,
    billingAddress
  });

  return await newUser.save();
};


export const getUsersByQuery = async (query: string, caseSensitive = false) => {
  const regex = new RegExp(query, caseSensitive ? "" : "i"); // "i" for case-insensitive

  return await User.find({
    $or: [
      { username: { $regex: regex } },
      { emailAddress: { $regex: regex } },
      { publicKey: { $regex: regex } },
    ],
  }).sort({ createdAt: -1 });
};

export const updateUserById = async (
  userId: string,
  data: any
): Promise<any> => {
  const updatedUser = await User.findByIdAndUpdate(userId, data, { new: true });
  return updatedUser;
};


export const fetchUser = async (emailAddress: string) => {
  return await User.findOne({ emailAddress });
};

export const fetchUserByPubKey = async (publicKey: string) => {
  return await User.findOne({
    publicKey: new RegExp(`^${publicKey}$`, "i"), // case-insensitive exact match
  });
};

// Token operations
export const saveToken = async (userId: string, token: string) => {
  return await Token.findOneAndUpdate(
    { _id: userId },
    { $push: { tokens: token } },
    { upsert: true, new: true }
  );
};
export const fetchToken = async (userId: mongoose.Types.ObjectId) => {
  return await Token.findOne({ userId }); // Fetch the latest token
};

// OTP operations

export const saveOtp = async (
  otp: string,
  uid: string
) => {
  const newOtp = new OTP({    
    otp,
    uid,
  });
  return await newOtp.save();
};

export const fetchOtpByUid = async (uid: string) => {
  return await OTP.findOne({ uid });
};

export const fetchOtpByEmail = async (emailAddress: string) => {
  return await OTP.findOne({ emailAddress }).sort({ createdAt: -1 }); // Fetch the latest OTP for the email
};

// Utility function to delete expired OTPs (optional)
export const deleteExpiredOtps = async () => {
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() - 10); // 10 minutes expiration time for OTPs
  await OTP.deleteMany({ createdAt: { $lt: expirationTime } });
};


export const updateUserInDb = async (
  _id: string,
  updates: Record<string, any>
) => {
  return await User.findOneAndUpdate(
    { _id },
    { $set: updates, updatedAt: new Date() },
    { new: true }
  );
};

interface TransactionInput {
  id: string;
  paymentMethod: "card" | "wallet" |"qr";
  to?: string;
  from?: string;
  amount: number;
  currency: string;
  status?: "pending" | "success" | "failure"; // optional, defaults to "pending"
  createdAt?: Date; // optional
}

interface TransactionUpdateInput {
  id: string;
  status?: string;
  paymentMethod?: "card" | "wallet" | "qr"; 
  to?: string;
  from?: string;
  amount?: number;
  currency?: string;
  errorMessage?: string;
  userEmail?: string;
  createdAt?: Date;
  txHash?: string;
  // add more fields here if needed
}


export const createTransaction = async (data: TransactionInput) => {
  const {
    id,
    to,
    from,
    paymentMethod,
    amount,
    currency,
    status = "pending",
    createdAt = new Date(),
  } = data;

  const newTx = new Transaction({
    id,
    to,
    from,
    txHash: id,
    paymentMethod,
    amount,
    currency,
    status,
    createdAt,
  });

  await newTx.save();
  return newTx;
};

export const getTransactionByPublicKey = async (publicKey: string) => {
  return await Transaction.find({
    $or: [
      { from: { $regex: `^${publicKey}$`, $options: 'i' } },
      { to: { $regex: `^${publicKey}$`, $options: 'i' } }
    ]
  });
};

export const getTransactionByID = async (id: string) => {
  return await Transaction.findOne({ id });
};
export const updateTransaction = async (
  id: string,
  updateFields: TransactionUpdateInput
) => {
  return await Transaction.findOneAndUpdate(
    { id },
    { ...updateFields, id, updatedAt: new Date() },
    { new: true, upsert: true }
  );
};

export const deleteTransactionByID = async (id: string) => {
  return await Transaction.findOneAndDelete({ id });
};




export const getNftByTokenAndSerial = async (
  tokenId: string,
  serialNumber: number
) => {
  return await Nft.findOne({ tokenId, serialNumber });
};

/**
 * Create or save a new NFT
 */
export const saveNft = async (nftData: any) => {
  const newNft = new Nft(nftData);
  return await newNft.save();
};

/**
 * Get all NFTs owned by a specific address
 */
export const getNftsByOwner = async (owner: string) => {
  return await Nft.find({ owner: new RegExp(`^${owner}$`, "i") });
};

/**
 * Update an NFT's metadata or owner
 */
export const updateNft = async (
  tokenId: string,
  serialNumber: number,
  updates: Record<string, any>
) => {
  return await Nft.findOneAndUpdate(
    { tokenId, serialNumber },
    { $set: updates, updatedAt: new Date() },
    { new: true }
  );
};

export const fetchProducts = async () => {
  return await Nft.find({ listed: true });
}

export const fetchProductByOwnedBySeller = async (publicKey: string) => {
  return await Nft.find({
    $or: [
      {
        listed: true,
        seller: { $regex: `^${publicKey}$`, $options: 'i' },
      },
      {
        listed: false,
        owner: { $regex: `^${publicKey}$`, $options: 'i' },
      },
    ],
  });
};
/**
 * Delete an NFT (use with caution)
 */
export const deleteNft = async (tokenId: string, serialNumber: number) => {
  return await Nft.findOneAndDelete({ tokenId, serialNumber });
};
