import {
  Client,
  Hbar,
  AccountCreateTransaction,
  PrivateKey,
  AccountBalanceQuery,
} from "@hashgraph/sdk";

import * as dotenv from "dotenv";
dotenv.config();

const MY_ACCOUNT_ID = process.env.ACCOUNT_ID as string;
const MY_PRIVATE_KEY = process.env.PRIVATE_KEY as string;

const hederaClient = Client.forTestnet();

hederaClient.setOperator(MY_ACCOUNT_ID, MY_PRIVATE_KEY);
console.log("Hedera connected successfully");

export const createAccount = async () => {
  const accountPrivateKey = PrivateKey.generateECDSA();
  const accountPublicKey = accountPrivateKey.publicKey;

  const initialBalance = 10;

  const response = await new AccountCreateTransaction()
    .setInitialBalance(new Hbar(initialBalance))
    .setKey(accountPublicKey)
    //Do NOT set an alias if you need to update/rotate keys in the future
    .setAlias(accountPublicKey.toEvmAddress())
    .execute(hederaClient);

  const receipt = await response.getReceipt(hederaClient);

  const newAccountId = receipt.accountId as unknown as string;

  return {
    publicKey: newAccountId.toString(),
    privateKey: accountPrivateKey.toString(),
    initialBalance,
  };
};


export const getBalance = async (accountId: string) => {
  const balance = await new AccountBalanceQuery()
      .setAccountId(accountId)
      .execute(hederaClient);
  return balance.hbars.toString();
}

