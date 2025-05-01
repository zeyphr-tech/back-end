// Base error class
export class BaseError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, BaseError.prototype);
  }
}

// Custom error: Invalid public key
export class InvalidPublicKeyError extends BaseError {
  constructor(message = "Invalid public key") {
    super(message, 400);
    Object.setPrototypeOf(this, InvalidPublicKeyError.prototype);
  }
}

// Custom error: Insufficient funds
export class InsufficientFundsError extends BaseError {
  constructor(message = "Insufficient funds") {
    super(message, 402);
    Object.setPrototypeOf(this, InsufficientFundsError.prototype);
  }
}

// Custom error: Transaction failed
export class TransactionFailedError extends BaseError {
  constructor(message = "Transaction failed") {
    super(message, 500);
    Object.setPrototypeOf(this, TransactionFailedError.prototype);
  }
}

// Main error handling function
export const handleCustomError = (err: any): BaseError => {
  const message = err?.message || "";

  // 🧾 ETHERS.JS specific errors
  if (
    message.includes("invalid address") ||
    message.includes("invalid checksum address")
  ) {
    return new InvalidPublicKeyError();
  }

  if (message.includes("insufficient funds")) {
    return new InsufficientFundsError();
  }

  if (
    message.includes("replacement fee too low") ||
    message.includes("transaction underpriced") ||
    message.includes("nonce has already been used")
  ) {
    return new TransactionFailedError(
      "Gas error or nonce issue: Transaction failed"
    );
  }

  // 🧾 JWT / AUTH errors
  if (message.includes("jwt expired")) {
    return new BaseError("Session expired. Please log in again", 401);
  }

  if (message.includes("invalid signature")) {
    return new BaseError("Invalid token signature", 401);
  }

  // 🧾 MONGOOSE / DB errors
  if (err.name === "ValidationError") {
    return new BaseError("Invalid data format", 400);
  }

  if (err.code === 11000) {
    return new BaseError("Duplicate entry found", 409);
  }

  // Fallback: return generic error
  return new TransactionFailedError(message || "An unexpected error occurred");
};
