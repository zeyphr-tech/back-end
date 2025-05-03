import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  txHash: { type: String, required: false, unique: true },
  from: { type: String, required: false },
  to: { type: String, requried:true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "IOTA" },
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
