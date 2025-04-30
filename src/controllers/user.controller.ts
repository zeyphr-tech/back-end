import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
import { fetchUser, saveToken, saveUser, updateUserInDb } from "../config/db";
import { encryptPrivateKey } from "../services/crypto.service";
import { generateKeyPair } from "../services/user.service";
import { signToken } from "../services/token.service";

// GET /api/users/:emailAddress
export const checkUserExists = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { emailAddress } = req.params;
  const user = await fetchUser(emailAddress);
  res.json({ existing: !!user });
};

// POST /api/users
export const registerUser = async (req: Request, res: Response): Promise<any> => {
  const { emailAddress, password } = req.body;

  if (!emailAddress || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const existingUser = await fetchUser(emailAddress);
  if (existingUser)
    return res.status(409).json({ error: "User already exists" });

  const { publicKey, privateKey } = generateKeyPair();

  const { encryptedPrivateKey } = encryptPrivateKey(privateKey, password);

  const username = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: "-",
    length: 3,
  });

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await saveUser({
    username,
    emailAddress,
    passwordHash,
    publicKey,
    pwdEncryptedPrivateKey: encryptedPrivateKey,
  });

  if (!newUser || !newUser._id) {
    return res.status(500).json({ error: "Failed to register user" });
  }

  let token = signToken({ _id: newUser._id.toString() ,publicKey});
  // Save the token in DB (tokens table)
  await saveToken(newUser._id.toString(), token);

  return res
    .status(201)
    .json({token});
};


export const updateUser = async (req: Request, res: Response):Promise<any> => {
  const { emailAddress, password, dataToUpdate } = req.body;

  if (!emailAddress || !password || !dataToUpdate) {
    return res
      .status(400)
      .json({ error: "Email, password, and dataToUpdate are required" });
  }

  const user = await fetchUser(emailAddress);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const updates: Record<string, any> = {};

  // If new password is being set, hash it and optionally re-encrypt private key
  if (dataToUpdate.password) {
    const newPasswordHash = await bcrypt.hash(dataToUpdate.password, 10);
    updates.passwordHash = newPasswordHash;

    if (user.pwdEncryptedPrivateKey) {
      const { encryptedPrivateKey } = encryptPrivateKey(
        user.pwdEncryptedPrivateKey,
        dataToUpdate.password
      );
      updates.pwdEncryptedPrivateKey = encryptedPrivateKey;
    }
  }

  // Copy remaining fields
  for (const [key, value] of Object.entries(dataToUpdate)) {
    if (key !== "password") {
      updates[key] = value;
    }
  }
  if (!user._id) {
    return res.status(500).json({ error: "User not found" });
  }

  const updatedUser = await updateUserInDb(user._id.toString(), updates);

  if (!updatedUser) {
    return res.status(500).json({ error: "Failed to update user" });
  }

  return res.json({ success: true, updated: true });
};