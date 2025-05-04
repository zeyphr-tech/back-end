import mongoose, { Schema, Document } from "mongoose";

// Interface for User document
export interface IUser extends Document {
  username: string;
  emailAddress: string;
  passwordHash: string;
  publicKey: string;
  pwdEncryptedPrivateKey: string;
  cardEncryptedPrivateKey: string;
  card: string;
  billingAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    emailAddress: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    publicKey: { type: String, required: true },
    pwdEncryptedPrivateKey: { type: String, required: true },
    cardEncryptedPrivateKey: { type: String, required: false },
    card: { type: String, required: false, default:"disabled" },
    billingAddress: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
