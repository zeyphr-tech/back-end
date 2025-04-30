import { fetchOtpByUid } from "../config/db";

export const createOtp = async () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
};

export const validateOtpService = async (uid: string, otp: string) => {
  const record = await fetchOtpByUid(uid);
  if (!record || record.otp !== otp) return false;

  return true;
};
