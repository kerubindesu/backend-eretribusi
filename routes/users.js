import express from "express"
import { getUsers, getUser, createUser, deleteUser, updateUser } from "../controllers/usersController.js"
import verifyJWT from "../middleware/verifyJWT.js"

const router = express.Router()

router.use(verifyJWT) // require auth for all user route

router.get("/", getUsers) // GET all users

router.get("/:id", getUser) // GET a single user

router.post("/", createUser) // POST user

router.delete("/:id", deleteUser) // DELETE user

router.patch("/:id", updateUser) // UPDATE a user

export default router