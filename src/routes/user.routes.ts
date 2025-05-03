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
router.get("/check-email/:emailAddress", checkUserExists);
router.get("/fetch-user", findExactUserByQuery);
router.post("/", registerUser);
router.put("/", updateUser);

export default router;
