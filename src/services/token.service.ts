import jwt from "jsonwebtoken";

interface TokenPayload {
  [key: string]: any;
}
const secretKey =
  process.env.JWT_SECRET ||
  "62d5adb6b05033bb1b2df7cc8636ab042fadd0253e6ed1d09bb6069481f7e76d";
/**
 * Sign a JWT token with a payload and secret key
 * @param payload - The payload object to encode into the token
 * @param secretKey - The secret key to sign the token
 * @returns The signed JWT token
 */
export const signToken = (
  payload: TokenPayload
): string => {
  return jwt.sign(payload, secretKey);
};

/**
 * Decode a JWT token and verify its authenticity
 * @param token - The JWT token to decode
 * @param secretKey - The secret key used to sign the token
 * @returns The decoded payload if valid, or throws error
 */
export const decodeToken = (token: string): TokenPayload => {
  return jwt.verify(token, secretKey) as TokenPayload;
};
