import { Wallet } from "ethers";

export const generateKeyPair = () => {
  const wallet = Wallet.createRandom();
  const publicKey = wallet.address.toLowerCase();
  const privateKey = wallet.privateKey;
  return { publicKey, privateKey };
};