import {
    TransferTransaction,
    Hbar,
    TokenId,
    AccountId,
    PrivateKey,
    Status,
} from "@hashgraph/sdk";
import { client, operatorId, operatorKey } from "./client";
import { associateToken } from "./associateToken";
import { getNftByTokenAndSerial, updateNft } from "../config/db";

export async function buyNFT(
  tokenIdStr: string,
  serialNumber: number,
  buyerIdStr: string,
  buyerKeyStr: string
): Promise<{
  txHash:string;
  to:string;
  from:string;
  tokenId: string;
  serialNumber: number;
  newOwner: string;
  price: number;
}> {
  const tokenId = TokenId.fromString(tokenIdStr);
  const buyerId = AccountId.fromString(buyerIdStr);
  const buyerKey = PrivateKey.fromString(buyerKeyStr);
  
  
    const nft = await getNftByTokenAndSerial(tokenIdStr, serialNumber);
  
  if (!nft || !nft.listed || !nft.price || !nft.seller) {
    throw new Error("NFT is not listed for sale.");
  }
  
  if (nft.seller === buyerIdStr) {
    throw new Error("Seller cannot buy their own NFT.");
  }
  
  const price = nft.price;
  const sellerId = AccountId.fromString(nft.seller);
  
  try {
    await associateToken(buyerIdStr, buyerKeyStr, tokenIdStr, client);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT")) {
      console.log("Buyer already associated with token.");
    } else {
      throw err;
    }
  }
  
  const hbarTx = await new TransferTransaction()
    .addHbarTransfer(buyerId, new Hbar(-price))
    .addHbarTransfer(sellerId, new Hbar(price))
    .freezeWith(client)
    .sign(buyerKey);
  
  const hbarTxRes = await hbarTx.execute(client);
  const txHash = hbarTxRes.transactionId.toString()
  
  
  const nftTx = await new TransferTransaction()
    .addNftTransfer(tokenId, serialNumber, operatorId, buyerId)
    .freezeWith(client)
    .sign(operatorKey);
  
    const nftTxRes = await nftTx.execute(client);
    const nftReceipt = await nftTxRes.getReceipt(client);
  
  if (nftReceipt.status !== Status.Success) {
    throw new Error(`NFT transfer failed: ${nftReceipt.status}`);
  }
  
  await updateNft(tokenIdStr, serialNumber,{
        owner: buyerIdStr,
        listed: false,
        price: null,
        seller: null,
        listedAt: null
    }
  );
  
  return {
    txHash:txHash,
    to:buyerIdStr,
    from:sellerId.toString(),
    tokenId: tokenIdStr,
    serialNumber,
    newOwner: buyerIdStr,
    price,
  };
}  