import mongoose, { Schema, Document } from "mongoose";

// Interface for Token document
export interface IToken extends Document {
  _id: mongoose.Types.ObjectId;
  tokens: string[];
}

const tokenSchema = new Schema<IToken>(
  {
  _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  tokens: [String]
  }
);


export const Token = mongoose.model<IToken>("Token", tokenSchema);
