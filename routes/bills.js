import express from "express"
import { getBills, getInfoBill, getUserBills, getBill, createBill, deleteBill, updateBill } from "../controllers/billsController.js"
import verifyJWT from "../middleware/verifyJWT.js"

const router = express.Router()

router.use(verifyJWT) // require auth for all bill

router.get("/", getBills) // GET all bills

router.get("/info/:id", getInfoBill) // GET a single bill & retributions

router.get("/user", getUserBills) // GET bills with retribution

router.get("/:id", getBill) // GET a single bill

router.post("/", createBill) // POST a new bill

router.delete("/:id", deleteBill) // DELETE a bill

router.patch("/:id", updateBill) // UPDATE a bill

export default router