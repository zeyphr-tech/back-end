import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "srirangankannan31@gmail.com",
    pass: "gqod gvov zpef mhmo", // Set this in your .env file
  },
});

export const sendOtpEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: "srirangankannan31@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}`,
    html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("OTP email sent: ", info.messageId);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};
