import express from "express";
import { loginUser } from "../controllers/auth.controller";

const router = express.Router();

// POST /api/auth/login
router.post("/login", loginUser);

export default router;
