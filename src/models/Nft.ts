import mongoose from "mongoose";

const nftSchema = new mongoose.Schema({
  tokenId: {
    type: String,
    required: true,
  },
  serialNumber: {
    type: Number,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  listed: {
    type: Boolean,
    default: false,
  },
  price: {
    type: Number,
    default: null, // HBAR value
  },
  seller: {
    type: String,
    default: null,
  },
  metadata: {
    type: String, // Store JSON or stringified metadata buffer
    required: true,
  },
  modifiedCount: {
    type: Number,
    default: 0,
  },
  matchedCount: {
    type: Number,
    default: 0,
  },
  listedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure uniqueness on (tokenId, serialNumber)
nftSchema.index({ tokenId: 1, serialNumber: 1 }, { unique: true });

export const Nft = mongoose.model("Nft", nftSchema);
