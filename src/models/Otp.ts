import mongoose, { Schema, Document } from "mongoose";

// Interface for OTP document
export interface IOTP extends Document {
  otp: string;
  uid: string;
  createdAt: Date;
  updatedAt: Date;
}

const otpSchema = new Schema<IOTP>(
  {
    otp: { type: String, required: true },
    uid: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const OTP = mongoose.model<IOTP>("OTP", otpSchema);
