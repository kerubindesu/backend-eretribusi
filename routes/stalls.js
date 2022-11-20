import express from "express"
import { getStalls, getFreeStalls, getStall, createStall, deleteStall, updateStall } from "../controllers/stallsController.js"
import verifyJWT from "../middleware/verifyJWT.js"

const router = express.Router()

router.use(verifyJWT) // require auth for all stall

router.get("/", getStalls) // GET all stalls

router.get("/free", getFreeStalls) // GET all free stalls

router.get("/:id", getStall) // GET a single stall

router.post("/", createStall) // POST a new stall

router.delete("/:id", deleteStall) // DELETE a stall

router.patch("/:id", updateStall) // UPDATE a stall

export default router