import {
    TransferTransaction,
    TokenId,
    AccountId,
    PrivateKey,
} from "@hashgraph/sdk";
import { client, operatorId } from "./client";
import { connectToDb } from "./db";
  
export async function listNFT(
  tokenIdStr: string,
  serialNumber: number,
  price: number,
  sellerIdStr: string,
  sellerKey: PrivateKey
): Promise<{
  tokenId: string;
  serialNumber: number;
  listedBy: string;
  price: number;
}> {
  const tokenId = TokenId.fromString(tokenIdStr);
  const sellerId = AccountId.fromString(sellerIdStr);
  
  const db = await connectToDb();
  const nfts = db.collection("nfts");
  
  const nft = await nfts.findOne({ tokenId: tokenIdStr, serialNumber });
  
  if (!nft) {
    throw new Error("NFT not found in the database.");
  }
  
  if (nft.listed === true) {
    throw new Error("NFT is already listed.");
  }
  
  if (nft.owner !== sellerIdStr) {
    throw new Error("Only the current owner can list this NFT.");
  }
  
  const transferTx = await new TransferTransaction()
    .addNftTransfer(tokenId, serialNumber, sellerId, operatorId)
    .freezeWith(client)
      .sign(sellerKey);
  
  const txResponse = await transferTx.execute(client);
  const receipt = await txResponse.getReceipt(client);
  
  if (receipt.status.toString() !== "SUCCESS") {
    throw new Error(`NFT transfer failed: ${receipt.status}`);
  }
  
  const update = {
    $set: {
      owner: operatorId.toString(),
      seller: sellerIdStr,
      listed: true,
      listedAt: new Date(),
      price: price,
    },
  };
  
  const result = await nfts.updateOne({ tokenId: tokenIdStr, serialNumber }, update);
  
  if (result.modifiedCount === 0) {
    throw new Error("Failed to update NFT listing status.");
  }
  
  return {
    tokenId: tokenIdStr,
    serialNumber,
    listedBy: sellerIdStr,
    price,
  };
}  