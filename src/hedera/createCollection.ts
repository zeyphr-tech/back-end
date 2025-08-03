import {
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    TokenId,
  } from "@hashgraph/sdk";
import { client, operatorId, operatorKey } from "./client";
  
export async function createCollection(name: string, symbol: string): Promise<string> {
  const createTx = await new TokenCreateTransaction()
    .setTokenName(name)
    .setTokenSymbol(symbol)
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setSupplyType(TokenSupplyType.Infinite)
    .setTreasuryAccountId(operatorId)
    .setAdminKey(operatorKey.publicKey)
    .setSupplyKey(operatorKey.publicKey)
    .freezeWith(client)
    .sign(operatorKey);

  const createRes = await createTx.execute(client);
  const receipt = await createRes.getReceipt(client);
  const tokenId: TokenId = receipt.tokenId!;

  return tokenId.toString();
}