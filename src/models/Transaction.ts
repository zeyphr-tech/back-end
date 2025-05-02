import mongoose from "mongoose";
import { string } from "zod";

const transactionSchema = new mongoose.Schema({
  transactionID: { type: String, required: true, unique: true },
  userEmail: { type: String, required: false },
  merchantEmail: { type: String, ref: "Merchant" }, // optional
  amount: { type: Number, required: true },
  currency: { type: String, default: "ETH" },
  paymentMethod: {
    type: String,
    enum: ["card", "wallet","qr"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  errorMessage: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

transactionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
