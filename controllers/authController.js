import User from "../models/userModel.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler"

export const logIn = asyncHandler(async (req, res) => {
    const username = req.body.username
    const password = req.body.password

    if (!username || !password) return res.status(400).json({ message: "Username dan password harus diisi" })

    const user = await User.findOne({ username }).exec() // Find user
    if (!user) return res.status(401).json({ message: "Username tidak ditemukan" })

    const match = await bcrypt.compare(password, user.password) // compare password
    if (!match) return res.status(401).json({ message: "Password tidak sesuai" })

    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": user.username,
                "name": user.name,
                "role": user.role
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "16s" }
    )

    const refreshToken = jwt.sign(
        { "username": user.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    )

    // Create secure cookie with refresh token 
    res.cookie("jwt", refreshToken, {
        httpOnly: true, //accessible only by web server
        sameSite: "None",
        secure: true, //https
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    // Send accessToken containing username and roles 
    res.json({ accessToken })
})

export const refresh = (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.status(401).json({ message: "Anda harus login terlebih dahulu" })

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) return res.status(403).json({ message: "Tidak ditemukan" })

            const user = await User.findOne({ username: decoded.username }).exec()
            if (!user) return res.status(401).json({ message: "Anda harus login terlebih dahulu" })

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": user.username,
                        "name": user.name,
                        "role": user.role
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "16s" }
            )

            res.json({ accessToken })
        })
    )
}

export const logOut = (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204)
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true })
    res.json({ message: "Cookie cleared" })
}