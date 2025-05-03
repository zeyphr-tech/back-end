import { Router } from "express";
import { enableTapandPay, initiateTransactionByCard, initiateTransactionByScanner } from "../controllers/machine.controller";

const router = Router();


router.post('/scan/new',initiateTransactionByScanner)
router.post("/card/new", initiateTransactionByCard);
router.post("/card/enable-tap-and-pay",enableTapandPay);


export default router;