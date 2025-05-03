import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || "your_32_byte_secret_key_goes_here_!!!";

function deriveKey(password: string, salt: string): Buffer {
  return crypto.scryptSync(password, salt, 32);
}

export function encryptPrivateKey(
  privateKey: string,
  password: string
): string {
  const key = deriveKey(password, SECRET_KEY);
  const iv = crypto.randomBytes(12); 

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(privateKey, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Concatenate IV, ciphertext, and auth tag
  return `${iv.toString("hex")}.${encrypted.toString("hex")}.${authTag.toString(
    "hex"
  )}`;
}

export function decryptPrivateKey(
  encryptedString: string,
  password: string
): string {
  const [ivHex, ciphertextHex, authTagHex] = encryptedString.split(".");
  const key = deriveKey(password, SECRET_KEY);
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
