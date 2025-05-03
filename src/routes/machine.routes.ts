import { Router } from "express";
import { initiateTransactionByCard, initiateTransactionByScanner } from "../controllers/machine.controller";

const router = Router();


router.post('/scan/new',initiateTransactionByScanner)
router.post("/card/new", initiateTransactionByCard);


export default router;