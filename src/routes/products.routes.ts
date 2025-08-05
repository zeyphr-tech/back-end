import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import bcrypt from "bcryptjs";
import { ethers } from "ethers";

import { getContract, getReadOnlyContract } from "../services/transfer.service";
import { fetchProducts, fetchUserByPubKey } from "../config/db";
import { decryptPrivateKey } from "../services/crypto.service";
import { mintToCollection } from "../hedera/mintNft";

dotenv.config();

const router = express.Router();

// Configure multer for memory storage (no temp file on disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

const { PINATA_API_KEY, PINATA_SECRET_API_KEY } = process.env;

// POST /products/new
router.post(
  "/new",
  upload.single("file"),
  async (req: any, res): Promise<any> => {
    try {
      const { title, description, quantity, amount, transferable, password } =
        req.body;
      const { publicKey } = req.user;

      // Validate user
      const user = await fetchUserByPubKey(publicKey);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const decryptedPrivateKey = decryptPrivateKey(
        user.pwdEncryptedPrivateKey,
        password
      );

      // Validate file
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "File is required" });
      }

      // Upload file to Pinata
      const formData = new FormData();
      formData.append("file", Buffer.from(file.buffer), {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      const fileResponse = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          maxBodyLength: Infinity,
          headers: {
            ...formData.getHeaders(),
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_API_KEY,
          },
        }
      );

      const imageURL = `https://gateway.pinata.cloud/ipfs/${fileResponse.data.IpfsHash}`;

      // Create metadata and upload it
      const metaData = {
        name: title,
        description,
        image: imageURL,
      };

      const metaDataResponse = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        metaData,
        {
          headers: {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_API_KEY,
          },
        }
      );

      const tokenURI = `https://gateway.pinata.cloud/ipfs/${metaDataResponse.data.IpfsHash}`;

      // Mint NFT
      const tx = await mintToCollection(
        publicKey,
        metaDataResponse.data,
        publicKey,
        amount
      );

      const receipt = tx

      res.status(200).json({ success: true, data: receipt });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to process form data" });
    }
  }
);

router.get("/fetch-items", async (req: any, res):Promise<any> => {
  try {
    const data = await fetchProducts();
    return res.status(200).json({ items: data });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
})
router.get("/fetch-items-by-owner", async (req: any, res):Promise<any> => {
  try {
    const { publicKey } = req.user;
    const contract = getReadOnlyContract();
    const total = await contract.getItemsByOwner(publicKey);
    const ownedItems: any[] = [];

    for (let i = 1; i <= total; i++) {
      try {
        const owner = await contract.ownerOf(i);
        const itemData = await contract.getItems(i).catch(() => null);
        const tokenURI = await contract.tokenURI(i);

        const isOwnedByUser = owner.toLowerCase() === publicKey.toLowerCase();
        const isListedByUser =
          itemData?.listed &&
          itemData?.seller?.toLowerCase() === publicKey.toLowerCase();

        if (isOwnedByUser || isListedByUser) {
          let image = "";
          try {
            const metadataRes = await fetch(tokenURI);
            const metadata = await metadataRes.json();
            image = metadata.image;
          } catch (err) {
            console.error(`Failed to fetch metadata for token ${i}:`, err);
          }

          let meatDatInfo :any =await axios.get(tokenURI)
          const supply = await contract.getAvailableSupply(i);

          ownedItems.push({
            tokenId: i,
            name: meatDatInfo?.data.name || "",
            desc: meatDatInfo.data.description || "",
            transferable: itemData?.transferable || false,
            price: itemData?.price?.toString() || "0",
            availableSupply: supply.toString() || 0,
            seller: itemData?.seller || "",
            buyer: itemData?.buyer || "",
            sold: itemData?.sold || false,
            listed: itemData?.listed || false,
            tokenURI,
            image,
          });
        }
      } catch (err) {
        console.error(`Error processing token ${i}:`, err);
      }
    }
    
    return res.status(200).json({ items: ownedItems });
  } catch (err) {
    console.error("Failed to fetch items by owner:", err);
    return res.status(500).json({ error: "Failed to fetch items by owner" });
  }
});

router.post("/edit", async (req: any, res):Promise<any> => {
  try {
    const { changes, password } = req.body;
    const { publicKey } = req.user;

    const user = await fetchUserByPubKey(publicKey);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const decryptedPrivateKey = decryptPrivateKey(
      user.pwdEncryptedPrivateKey,
      password
    );

    const contract = getContract(decryptedPrivateKey);

    for (const product of changes) {
      const { tokenId, listed, price, currentSupply, newSupply } = product;

      // Handle listing/unlisting
      if (typeof listed === "boolean") {
        if (listed) {
          const tx = await contract.listItem(tokenId, ethers.parseEther(price));
          await tx.wait();
        } else {
          const tx = await contract.unlistItem(tokenId);
          await tx.wait();
        }
      }

      // Handle supply change
      if (
        typeof currentSupply === "number" &&
        typeof newSupply === "number" &&
        currentSupply !== newSupply
      ) {
        const diff = newSupply - currentSupply;
        if (diff > 0) {
          const tx = await contract.increaseSupply(tokenId, diff);
          await tx.wait();
        } else {
          const tx = await contract.burnSupply(tokenId, Math.abs(diff));
          await tx.wait();
        }
      }
    }

    return res
      .status(200)
      .json({ message: "All changes applied successfully." });
  } catch (error) {
    console.error("Error processing item changes:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});



export default router;
