import express from "express";
import { logIn, refresh, logOut } from "../controllers/authController.js"
import loginLimiter from "../middleware/loginLimiter.js";

const router = express.Router()


router.post("/", loginLimiter, logIn)

router.get("/refresh", refresh)

router.post("/logout", logOut)

export default router