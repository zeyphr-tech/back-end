import crypto from "crypto";

export function encryptPrivateKey(
  privateKey: string,
  password: string
): { encryptedPrivateKey: string } {
  const iv = crypto.randomBytes(16);
  const salt = crypto.randomBytes(16);

  // Derive a 32-byte encryption key from the password and salt
  const key = crypto.scryptSync(password, salt, 32);

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  let encrypted = cipher.update(privateKey, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    encryptedPrivateKey: encrypted,
  };
}

export function decryptPrivateKey(
  encryptedData: string,
  password: string,
  ivHex: string,
  saltHex: string
): string {
  const iv = Buffer.from(ivHex, "hex");
  const salt = Buffer.from(saltHex, "hex");

  const key = crypto.scryptSync(password, salt, 32);
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
