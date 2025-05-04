import nodemailer from "nodemailer";
import path from "path";
import fs from "fs/promises";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "srirangankannan31@gmail.com",
    pass: process.env.EMAIL_PASSKEY, // Set this in your .env file
  }
});

export const sendOtpEmail = async (email: string, otp: string) => {
  const htmlFilePath = path.join(__dirname, "otp_email_template.html");

  // Read the HTML file content
  const htmlContent = await fs.readFile(htmlFilePath, { encoding: "utf8" });

  // Replace the placeholder with the actual OTP value
  const htmlWithOtp = htmlContent.replace("${otp}", otp);

  const mailOptions = {
    from: "srirangankannan31@gmail.com",
    to: email,
    subject: `Your One-Time Password (OTP) for Zeyphr`,
    text: `Your OTP code is: ${otp}`,
    html: htmlWithOtp,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("OTP email sent: ", info.messageId);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

export const sendEmail = async (email: string, billingAddress: string) => {
  const htmlFilePath = path.join(__dirname, "enable_card_template.html");

  // Read the HTML file content
  const htmlContent = await fs.readFile(htmlFilePath, { encoding: "utf8" });

  const htmlWithOtp = htmlContent.replace("${billingAddress}", billingAddress);

  // Replace the placeholder with the actual OTP value

  const mailOptions = {
    from: "srirangankannan31@gmail.com",
    to: email,
    subject: `Thanks for Enabling Your NFC Card — Here's What’s Next`,
    html: htmlWithOtp,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("OTP email sent: ", info.messageId);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};
