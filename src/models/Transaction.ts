import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  transactionID: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: "Merchant" }, // optional
  amount: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  paymentMethod: {
    type: String,
    enum: ["card", "wallet", "upi", "bank_transfer", "cash"],
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
