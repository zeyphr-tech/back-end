import { Router } from "express";
import {
  deleteTransaction,
  getTransactionStatus,
  initiateTransaction,
  newTransaction,
  updateTransactionStatus
} from "../controllers/transaction.controller";

const router = Router();

router.post("/card/new", newTransaction);
router.post('/scan/new',initiateTransaction)
router.post('/status/', getTransactionStatus)
router.put('/update', updateTransactionStatus)
router.delete('/delete',deleteTransaction)

export default router;