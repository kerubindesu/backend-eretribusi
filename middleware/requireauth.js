import jwt from "jsonwebtoken"
import { config } from "dotenv"
import User from "../models/userModel.js"

const SECRET = "kerubindesuandthisisrandomwords"

const requireAuth = async (req, res, next) => {

    // verifikasi auth
    const { authorization } = req.headers

    if (!authorization) {
        return res.status(401).json({ error: "Authorization token required" })
    }

    const token = authorization.split(' ')[1]

    try {
        const { _id } = jwt.verify(token, SECRET)
        req.user = await User.findOne({ _id }).select('_id')
        next()
    } catch (error) {
        console.log(error)
        res.status(401).json({ error: "Request is not authorized" })
    }
}

export default requireAuth