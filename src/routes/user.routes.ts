import { Router } from "express";
import {
  checkUserExists,
  fetchUserByQuery,
  findExactUserByQuery,
  registerUser,
  updateUser,
  getUserBalance,
} from "../controllers/user.controller";

const router = Router();

router.get("/search", fetchUserByQuery);
router.post("/check-email", checkUserExists);
router.get("/fetch-user", findExactUserByQuery);
router.post("/new", registerUser);
router.put("/", updateUser);
router.get("/get-balance", getUserBalance);

export default router;
