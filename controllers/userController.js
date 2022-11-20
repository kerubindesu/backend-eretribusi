import User from "../models/userModel.js"
import jwt from "jsonwebtoken"
import { config } from "dotenv"

const SECRET = "kerubindesuandthisisrandomwords"

const createToken = (_id) => {
    return jwt.sign({ _id }, SECRET, { expiresIn: "3d" })
}

// login user
export const userLogin = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.login(email, password)

        // create a token
        const token = createToken(user._id)

        res.status(200).json({ token })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// register user
export const userRegister = async (req, res) => {
    const { name, email, role, password } = req.body

    try {
        const user = await User.register(name, email, role, password)

        // create a token
        const token = createToken(user._id)

        res.status(200).json({ token })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// GET all users

// GET a single user
export const getUserAuth = async (req, res) => {
    const user_id = req.user._id

    try {
        const user = await User.findById(user_id)

        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}