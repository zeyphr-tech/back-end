import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
import {
  fetchUser,
  getUsersByQuery,
  saveToken,
  saveUser,
  updateUserInDb,
} from "../config/db";
import { encryptPrivateKey } from "../services/crypto.service";
import { generateKeyPair } from "../services/user.service";
import { signToken } from "../services/token.service";
import { userSchema } from "../schema/user.schema";

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

  const validatedData = userSchema.safeParse(req.body);
  if (!validatedData.success) {
    return res.status(400).json({ error: validatedData.error.message }); 
  }
  const { emailAddress, password } = validatedData.data;

  if (!emailAddress || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const existingUser = await fetchUser(emailAddress);
  if (existingUser)
    return res.status(409).json({ error: "User already exists" });

  const { publicKey, privateKey } = generateKeyPair();

  const  encryptedPrivateKey  = encryptPrivateKey(privateKey, password);

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

  let token = signToken({
    _id: newUser._id.toString(),
    publicKey  
  });
  // Save the token in DB (tokens table)
  await saveToken(newUser._id.toString(), token);

  return res
    .status(201)
    .json({token});
};


export const findExactUserByQuery = async (req: Request, res: Response): Promise<any> => {
  
  const { query } = req.query;

  if (!query || typeof query!== "string") {
    return res.status(400).json({ message: "Invalid search query." });
  }

  const users = await getUsersByQuery(query);

  if (users.length > 1) {
    return res.status(404).json({ message: "Two or more User found." });
  }

  const userData = users.map((user) => ({
    _id: user._id,
    username: user.username,
    emailAddress: user.emailAddress,
    publicKey: user.publicKey,
  }));

  res.status(200).json(userData[0]);
}


export const updateUser = async (req: any, res: Response):Promise<any> => {
  const { dataToUpdate } = req.body; // get userId from token 
  const {_id} = req.user;

  const user = await fetchUser(_id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const updates: Record<string, any> = {};

  // If new password is being set, hash it and optionally re-encrypt private key
  if (dataToUpdate.password) {
    const newPasswordHash = await bcrypt.hash(dataToUpdate.password, 10);
    updates.passwordHash = newPasswordHash;

    if (user.pwdEncryptedPrivateKey) {
      const encryptedPrivateKey  = encryptPrivateKey(
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


/**
 * Search user by email address or public key.
 * Accepts { query: string } in the body.
 */
export const fetchUserByQuery = async (req: Request, res: Response):Promise<any> => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "Invalid search query." });
    }

     const users = await getUsersByQuery(query);


    if (users.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const userData = users.map((user) => ({
      _id: user._id,
      username: user.username,
      emailAddress: user.emailAddress,
      publicKey: user.publicKey,
    }));
    
    if (req.headers.accept?.includes("text/html")) {
      return res.send(`<pre>${JSON.stringify(userData, null, 2)}</pre>`);
    }

    return res.status(200).json(userData);

  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error during user search." });
  }
};