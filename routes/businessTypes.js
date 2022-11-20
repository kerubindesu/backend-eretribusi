import express from "express"
import { getBusinessTypes, getBusinessType, createBusinessType, deleteBusinessType, updateBusinessType } from "../controllers/businessTypesController.js"
import verifyJWT from "../middleware/verifyJWT.js"

const router = express.Router()

router.use(verifyJWT) // require auth for all type of business

router.get("/", getBusinessTypes) // GET all type of busineses

router.get("/:id", getBusinessType) // GET a single type of busineses

router.post("/", createBusinessType) // POST a new type of business

router.delete("/:id", deleteBusinessType) // DELETE a type of business

router.patch("/:id", updateBusinessType) // UPDATE a type of business

export default router