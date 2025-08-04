import {
    TokenAssociateTransaction,
    TokenId,
    AccountId,
    PrivateKey,
    Client,
} from "@hashgraph/sdk";
  
export async function associateToken(
  accountIdStr: string,
  privateKeyStr: string,
  tokenIdStr: string,
  client: Client
): Promise<void> {
  const accountId = AccountId.fromString(accountIdStr);
  const privateKey = PrivateKey.fromString(privateKeyStr);
  const tokenId = TokenId.fromString(tokenIdStr);
  
  const tx = await new TokenAssociateTransaction()
    .setAccountId(accountId)
    .setTokenIds([tokenId])
    .freezeWith(client)
    .sign(privateKey);
  
  const res = await tx.execute(client);
  const receipt = await res.getReceipt(client);
  
  if (receipt.status.toString() !== "SUCCESS") {
    throw new Error(`Token association failed: ${receipt.status}`);
  }  
}  