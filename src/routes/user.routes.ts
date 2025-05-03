import { Router } from "express";
import {
  checkUserExists,
  fetchUserByQuery,
  findExactUserByQuery,
  registerUser,
  updateUser,
} from "../controllers/user.controller";

const router = Router();

router.get("/search", fetchUserByQuery);
router.post("/check-email", checkUserExists);
router.get("/fetch-user", findExactUserByQuery);
router.post("/new", registerUser);
router.put("/", updateUser);

export default router;
