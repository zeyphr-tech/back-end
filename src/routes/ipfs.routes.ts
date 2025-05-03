import express from "express";
import multer from "multer";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const { PINATA_API_KEY, PINATA_SECRET_API_KEY } = process.env;

router.post("/upload-image", upload.single("file"), async (req:any, res) => {
  try {
    const fileStream = fs.createReadStream(req.file.path);
    const formData = new FormData();
    formData.append("file", fileStream);

    const response = await axios.post(
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

    fs.unlinkSync(req.file.path); // cleanup

    res.json({
      url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload image to IPFS" });
  }
});

router.post("/upload-metadata", async (req, res) => {
  try {
    const metadata = req.body;

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      metadata,
      {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      }
    );

    res.json({
      url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload metadata to IPFS" });
  }
});

export default router;
