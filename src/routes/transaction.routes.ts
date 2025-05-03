import { Router } from "express";
import {
  deleteTransaction,
  getAllTransactionByUser,
  getTransactionStatus,
  newTransaction,
  updateTransactionStatus
} from "../controllers/transaction.controller";

const router = Router();

router.post("/new", newTransaction);
router.post('/status', getTransactionStatus)
router.get('/',getAllTransactionByUser)
router.put('/update', updateTransactionStatus)
router.delete('/delete',deleteTransaction)

export default router;