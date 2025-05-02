import crypto from "crypto";

function deriveKeyAndIV(password: string) {
  const hash = crypto.createHash("sha512").update(password).digest();
  const key = hash.slice(0, 32); // 32 bytes = 256-bit key
  const iv = hash.slice(32, 32 + 12); // 12 bytes = 96-bit IV (GCM)
  return { key, iv };
}

// Encrypts and returns a single hex string: [ciphertext_hex].[authTag_hex]
export function encryptPrivateKey(
  privateKey: string,
  password: string
): string {
  const { key, iv } = deriveKeyAndIV(password);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(privateKey, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${encrypted.toString("hex")}.${authTag.toString("hex")}`;
}

// Decrypts using the combined hex string
export function decryptPrivateKey(
  encryptedString: string,
  password: string
): string {
  const [ciphertextHex, authTagHex] = encryptedString.split(".");
  const { key, iv } = deriveKeyAndIV(password);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertextHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
