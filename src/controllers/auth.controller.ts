import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { fetchUser, saveToken } from "../config/db";
import { signToken } from "../services/token.service";
import { userSchema } from "../schema/user.schema";

export const loginUser = async (
  req: Request,
  res: Response
): Promise<any> => {

  const validatedData = userSchema.safeParse(req.body);
  if (!validatedData.success) {
    return res.status(400).json({ error: validatedData.error.message }); 
  }
  const { emailAddress, password } = validatedData.data;

  if (!emailAddress || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await fetchUser(emailAddress);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const payload = { _id: user._id, publicKey: user.publicKey };
  const token = signToken(payload);

  // Save the token in DB (tokens table)
  if (!user._id) return res.status(500).json({ error: "User ID not found" });

  await saveToken(user._id.toString(), token); // Ensure _id is treated as a string

  return res.status(200).json({ success: true, token });
};
