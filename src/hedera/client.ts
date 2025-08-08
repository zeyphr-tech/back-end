import { Client, PrivateKey, AccountId } from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

const operatorId: AccountId = AccountId.fromString(process.env.MARKETPLACE_ID!);
const operatorKey: PrivateKey = PrivateKey.fromString(process.env.MARKETPLACE_KEY!);

const client: Client = Client.forTestnet().setOperator(operatorId, operatorKey);

export { client, operatorId, operatorKey };