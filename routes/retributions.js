import express from "express"
import { getRetributions, getRetribution, createRetribution, updateRetribution, deleteRetribution } from "../controllers/retributionController.js"
import requireAuth from "../middleware/requireauth.js"

const router = express.Router()

// require auth for all retribution auth
router.use(requireAuth)

// GET all retributions
router.get("/", getRetributions)

// GET a single retribution
router.get("/:id", getRetribution)

// POST a new retribution
router.post("/", createRetribution)

// DELETE a retribution
router.delete("/:id", deleteRetribution)

// UPDATE a retribution
router.patch("/:id", updateRetribution)

export default router