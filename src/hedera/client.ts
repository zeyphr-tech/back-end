import { Client, PrivateKey, AccountId } from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();
const MY_ACCOUNT_ID = process.env.ACCOUNT_ID as string;
const MY_PRIVATE_KEY = process.env.PRIVATE_KEY as string;
const MY_PUBLIC_KEY = process.env.PUBLIC_KEY as string;

const operatorId: AccountId = AccountId.fromString(MY_ACCOUNT_ID);
const operatorKey: PrivateKey = PrivateKey.fromString(MY_PRIVATE_KEY);

const client: Client = Client.forTestnet().setOperator(operatorId, operatorKey);

export { client, operatorId, operatorKey };