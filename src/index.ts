import express from "express";
import cors from "cors";
import otpRoutes from "./routes/otp.routes";
import authRoutes from "./routes/auth.routes"
import userRoutes from "./routes/user.routes";
import { authMiddleware } from "./middlewares/auth.middleware";
import dotenv from "dotenv";
import { connectDb } from "./config/db";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(authMiddleware);

app.use("/api/otp", otpRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);


app.listen(3000, async() => {
  console.log("Server is running on port 3000");
  await connectDb();

})