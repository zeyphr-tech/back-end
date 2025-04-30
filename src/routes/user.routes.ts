import { Router } from "express";
import { checkUserExists, registerUser, updateUser } from "../controllers/user.controller";

const router = Router();

router.get("/:emailAddress", checkUserExists);
router.post("/", registerUser);
router.put("/", updateUser);

export default router;
