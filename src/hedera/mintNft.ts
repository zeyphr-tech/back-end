import {
    TokenMintTransaction,
    TokenId,
  } from "@hashgraph/sdk";
import { client, operatorId, operatorKey } from "./client";
import { connectToDb } from "./db";

interface MintResult {
  tokenId: string;
  serialNumber: number;
}
  
export async function mintToCollection(
  tokenIdStr: string,
  metadataBuffer: Buffer,
  minterAccountId: string,
  initialPrice: number
): Promise<MintResult> {
  const tokenId = TokenId.fromString(tokenIdStr);
  
  const mintTx = await new TokenMintTransaction()
    .setTokenId(tokenId)
    .setMetadata([metadataBuffer])
    .freezeWith(client)
    .sign(operatorKey);
  
  const mintRes = await mintTx.execute(client);
  const mintReceipt = await mintRes.getReceipt(client);
  
  if (!mintReceipt.serials || mintReceipt.serials.length === 0) {
    throw new Error("No serial numbers returned from mint transaction");
  }
  
  const serial = mintReceipt.serials[0].toNumber();
  
  const db = await connectToDb();
  const nftsCollection = db.collection("nfts");
  
  await nftsCollection.insertOne({
    tokenId: tokenIdStr,
    serialNumber: serial,
    metadata: metadataBuffer.toString(), 
    minter: minterAccountId,
    owner: operatorId.toString(),
    listed: true,
    price: initialPrice,
    seller: operatorId.toString(),
    mintedAt: new Date(),
    listedAt: new Date(),
  });
  
  return {
    tokenId: tokenIdStr,
    serialNumber: serial,
  };
}  