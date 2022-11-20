import mongoose from "mongoose"
import User from "../models/userModel.js"
import Retribution from "../models/retributionModel.js"
import validator from "validator"
import bcrypt from "bcrypt";

// GET user auth
export const getUserAuth = async (req, res) => {
    const user_id = req.user._id
    try {
        const user = await User.findById(user_id)

        res.status(200).json(user)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

// GET all users
export const getUsers = async (req, res) => {
    const q = req.query.q
    const limit = parseInt(req.query.limit) || 10

    let totalItems

    await User.find({}).countDocuments().then(async (count) => {
        totalItems = count
        await User.find({
            $or: [
                { "name": { $regex: q, $options: "i" } },
                { "address": { $regex: q, $options: "i" }, },
                { "business_type": { $regex: q, $options: "i" }, },
                { "username": { $regex: q, $options: "i" } },
                { "role": { $regex: q, $options: "i" } },
            ]
        })
            .where({ "role": { $ne: 'Admin' } },)
            .select("-password -createDAt -updatedAt")
            .sort({ "name": "asc" })
            .limit(limit)
            .then((result) => {
                if (!result) return res.status(404).json({ message: "Data tidak ditemukan" })
                return res.status(200).json({ data: result, totalItems })
            })
    })
}

// GET a single user
export const getUser = async (req, res) => {
    const { id } = req.params

    try {
        const user = await User.findById(id)

        return res.status(200).json(user)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}

// register user
export const createUser = async (req, res) => {
    const { name, business_type, address, username, role, password } = req.body

    try {
        const user = await User.register(name, business_type, address, username, role, password)

        return res.status(200).json({ user })
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}

export const updateUser = async (req, res) => {
    const { id } = req.params
    const { name, business_type, address, username, role, newPassword } = req.body

    if (!username) res.status(400).json({ message: "Harap mengisi username" })

    if (newPassword) {
        if (!validator.isStrongPassword(newPassword)) res.status(400).json({ message: "Password minimal 8 karakter setidaknya mengandung huruf kecil a-z, huruf kapital A-Z, angka 0-9 dan karakter khusus !@#$%^&*" })
    }

    const check = await User.findOne({ _id: id, username: username })
    const exists = await User.findOne({ username })
    if (!check && exists) return res.status(400).json({ message: "Username sudah digunakan!" })

    try {
        let password
        const salt = await bcrypt.genSalt(10)
        if (newPassword) password = await bcrypt.hash(newPassword, salt)
        const found = await User.findById({ _id: id })
        if (!newPassword) password = found.password
        const user = await User.findByIdAndUpdate({ _id: id }, { name, business_type, address, username, role, password })

        return res.status(200).json({ user })
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}

// Delete user
export const deleteUser = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: "User tidak ditemukan" })

    try {
        const user = await User.findOneAndDelete({ _id: id })
        const retribution = await Retribution.findOne({ user: id })
        if (retribution) await Retribution.findOneAndDelete({ user: id })

        return res.status(200).json({ user })
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}