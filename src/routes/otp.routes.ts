import { Router } from "express";
import { generateOtp, validateOtp } from "../controllers/otp.controller";

const router = Router();

// POST /api/otp/new - Send OTP to email and return UID
router.post("/new", generateOtp);

// POST /api/otp/validate - Validate OTP with UID
router.post("/validate", validateOtp);

export default router;
