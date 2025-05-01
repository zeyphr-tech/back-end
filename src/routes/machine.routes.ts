import { Router } from "express";
import {
  newTransaction
} from "../controllers/machine.controller";

const router = Router();

router.post("/new", newTransaction);

export default router;
