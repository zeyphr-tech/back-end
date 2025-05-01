import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

export const transferEther = async (
  to: string,
  amountInEther: string,
  privateKey: string
) => {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);

  const tx = await wallet.sendTransaction({
    to,
    value: ethers.parseEther(amountInEther),
  });

  await tx.wait();
  return tx;
};

