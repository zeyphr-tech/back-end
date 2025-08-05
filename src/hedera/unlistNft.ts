import {
    TransferTransaction,
    TokenId,
    AccountId,
} from "@hashgraph/sdk";
  
import { client, operatorId, operatorKey } from "./client";
import { associateToken } from "./associateToken";
import { getNftByTokenAndSerial, updateNft } from "../config/db";
  
export async function unlistNFT(
  tokenIdStr: string,
  serialNumber: number,
  recipientIdStr: string,
  sellerPrivateKeyStr: string
): Promise<{
  tokenId: string;
  serialNumber: number;
  newOwner: string;
  listed: boolean;
}> {
  const tokenId = TokenId.fromString(tokenIdStr);
  const recipientId = AccountId.fromString(recipientIdStr);
  

  
  const nft = await getNftByTokenAndSerial(tokenIdStr, serialNumber);
  
  if (!nft) {
    throw new Error("NFT not found in database.");
  }
  
  if (!nft.listed) {
    throw new Error("NFT is not currently listed.");
  }
  
  if (nft.seller !== recipientIdStr) {
    throw new Error("Only the original seller can unlist this NFT.");
  }
  
  try {
    await associateToken(recipientIdStr, sellerPrivateKeyStr, tokenIdStr, client);
  } catch (err: any) {
    if (err.message.includes("TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT")) {
      console.log("Token already associated.");
    } else {
      throw err;
    }
  }
  
  const transferTx = await new TransferTransaction()
    .addNftTransfer(tokenId, serialNumber, operatorId, recipientId)
    .freezeWith(client)
    .sign(operatorKey);
  
  const txResponse = await transferTx.execute(client);
  const receipt = await txResponse.getReceipt(client);
  
  if (receipt.status.toString() !== "SUCCESS") {
    throw new Error(`NFT transfer failed: ${receipt.status}`);
  }
  
  const update = {
    $set: {
      owner: recipientIdStr,
      listed: false,
      price: null,
      seller: null,
      listedAt: null,
    },
  };
  
  const result = await updateNft(tokenIdStr, serialNumber, update);
  
  if (result && result.matchedCount === 0) {
    throw new Error("Failed to update NFT.");
  }
  
  return {
    tokenId: tokenIdStr,
    serialNumber,
    newOwner: recipientIdStr,
    listed: false,
  };
}  