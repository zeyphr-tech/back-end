import { Request, Response, NextFunction } from "express";
import { match } from "path-to-regexp";
import { decodeToken } from "../services/token.service";

const whitelist = [
  "/api/otp/new",
  "/api/otp/validate",
  "/api/auth/login",
  "/api/users/check-email:emailAddress",
  "/api/users",
];

const isWhitelisted = (path: string) => {
  return whitelist.some((pattern) => {
    const matcher = match(pattern, { decode: decodeURIComponent });
    return matcher(path) !== false;
  });
};
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (isWhitelisted(req.path)) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized: No token" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = decodeToken(token);
    // fetch token from db and check if it exists
    if (!decoded) {
      res.status(401).json({ error: "Unauthorized: Invalid token" });
      return; 
    }

    // Attach user info to request (optional)
    (req as any).user = decoded;

    next();
  } catch (error) {
    console.error("JWT validation failed:", error);
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};
