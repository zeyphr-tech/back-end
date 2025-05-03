import { Router } from "express";
import {
  checkUserExists,
  fetchUserByQuery,
  registerUser,
  updateUser,
} from "../controllers/user.controller";

const router = Router();

router.get("/:emailAddress", checkUserExists);
router.post("/", registerUser);
router.put("/", updateUser);
router.post("/users/search", fetchUserByQuery);

export default router;
