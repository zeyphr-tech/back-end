import { Request, Response } from "express";
import { createOtp, validateOtpService } from "../services/otp.service"; // example service import
import { otpSchema, otpValidateSchema } from "../schema/otp.schema";
import { sendOtpEmail } from "../utils/email";
import { v4 as uuidv4 } from "uuid";
import  { saveOtp } from "../config/db"

// Generate OTP and send to email
export const generateOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    
    // Validate email from request body
    const validatedData = otpSchema.safeParse(req.body.emailAddress);

    if (!validatedData.success) {
      res.status(400).json({
        success: false,
        error: validatedData.error.message,
      });
      return;
    }

    const {emailAddress} = validatedData.data;

    // Generate UID and create OTP
    const otp = await createOtp(); // Make sure this function handles OTP creation/send

    await sendOtpEmail(emailAddress, otp);
    const uid = uuidv4()
    await saveOtp(otp, uid);

    res.status(200).json({ uid });
  } catch (error) {
    console.error("Error generating OTP:", error);
    res.status(500).json({ success: false, error: "Error generating OTP" });
  }
};

// Validate OTP
export const validateOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validatedData = otpValidateSchema.safeParse(req.body);

    if (!validatedData.success) {
      res.status(400).json({
        success: false,
        error: validatedData.error.message,
      });
      return;
    }
    const { uid, otp } = req.body;
    const isVerified = await validateOtpService(uid, otp); // Assuming service logic validates OTP
    if (isVerified) {
      res.status(200).json({ verified: true });
    } else {
      res.status(400).json({ error: "Invalid OTP" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error validating OTP" });
  }
};
