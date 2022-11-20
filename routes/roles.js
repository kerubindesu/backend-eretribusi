import express from "express"
import { getRoles, getRole, createRole, deleteRole, updateRole } from "../controllers/rolesController.js"
import verifyJWT from "../middleware/verifyJWT.js"

const router = express.Router()

router.use(verifyJWT) // require auth for all role

router.get("/:id", getRole) // GET a single role

router.get("/", getRoles) // GET all roles

router.post("/", createRole) // POST a new role

router.delete("/:id", deleteRole) // DELETE a role

router.patch("/:id", updateRole) // UPDATE a role

export default router