import express from "express"
import { getRetributions, getRetribution, getUserRetribution, createRetribution, updateRetribution, deleteRetribution } from "../controllers/retributionsController.js"
import verifyJWT from "../middleware/verifyJWT.js"

const router = express.Router()

router.use(verifyJWT) // require auth for all retribution auth

router.get("/", getRetributions) // GET all retributions

router.get("/user", getUserRetribution) // GET a single retribution

router.get("/:id", getRetribution) // GET a single retribution

router.post("/", createRetribution) // POST a new retribution

router.delete("/:id", deleteRetribution) // DELETE a retribution

router.patch("/:id", updateRetribution) // UPDATE a retribution

export default router