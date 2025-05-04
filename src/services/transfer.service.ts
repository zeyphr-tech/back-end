import { ethers } from "ethers";
import dotenv from "dotenv";

//@ts-ignore
import contractABI from "../config/abi.json";

dotenv.config();


const contractAddress = process.env.CONTRACT_ADDRESS || "0x33d7F263c1F440c83Cc6573ffeA761F8ab3c0a32";
const rpcUrl =process.env.RPC_URL || "https://json-rpc.evm.testnet.iotaledger.net/";
 

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

export const getContract = (privateKey: string) => {
  if (typeof privateKey !== "string" || privateKey.length === 0) {
    throw new Error("Give Private key");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, contractABI, wallet);

  return contract;
};


export const bulkBuyItems = async (tokenIds: number[], privateKey:string) => {
  try {
    const contract = getContract(privateKey);

    const totalPrice = await contract.getBulkTotalPrice(tokenIds);

    const totalPriceInEther = ethers.formatEther(totalPrice);

    const tx = await contract.purchaseItems(tokenIds, {
      value: ethers.parseEther(totalPriceInEther),
    });
    return  tx.wait();
  } catch (error) {
    console.error(error);
  }
};


