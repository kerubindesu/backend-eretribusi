import Retribution from "../models/retributionModel.js"
import mongoose from "mongoose"
import Stall from "../models/stallModel.js"
import User from "../models/userModel.js"

// GET all retributions
export const getRetributions = async (req, res) => {
    const { q } = req.query
    const limit = parseInt(req.query.limit) || 10

    const queryParseInt = parseInt(req.query.q)
    const intQuery = isNaN(queryParseInt) ? "" : queryParseInt

    let totalItems

    // filter stall dan ambil _id
    const stall = await Stall.find({
        $or: [
            { "type": { $regex: q, $options: "i" }, },
            { "name": { $regex: q, $options: "i" } },
            { "size": intQuery },
        ]
    }).select("_id")

    // filter user dan ambil _id
    const user = await User.find({
        $or: [
            { "name": { $regex: q, $options: "i" } },
            { "address": { $regex: q, $options: "i" }, },
            { "business_type": { $regex: q, $options: "i" }, },
        ]
    }).select("_id")

    await Retribution.find().countDocuments().then(async (count) => {
        totalItems = count

        // gunakan _id stall dan _id user setelah difilter
        await Retribution.find({ $or: [{ stall: stall }, { user: user }] })
            .populate("stall", "-_id -createdAt -updatedAt")
            .populate("user", "-_id -password")
            .sort({ "user": "desc" })
            .limit(limit)
            .then((result) => {
                if (!result) return res.status(404).json({ message: "Data tidak ditemukan" })

                return res.status(200).json({ data: result, totalItems })
            })
    })
}

// GET a single retribution
export const getRetribution = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: "Retribution tidak ditemukan" })

    await Retribution.findById({ _id: id })
        .populate("user")
        .populate("stall")
        .populate({ path: "bills", options: { sort: { 'createdAt': 1 } } })
        .populate("invoices")
        .then((result) => {
            if (!result) return res.status(404).json({ message: "Retribution tidak ditemukan" })

            res.status(200).json(result)
        })
}

// GET a single retribution by user id
export const getUserRetribution = async (req, res) => {
    const username = req.username
    const user = await User.findOne({ username })
    const uid = user._id

    if (!mongoose.Types.ObjectId.isValid(uid)) return res.status(404).json({ message: "Retribution tidak ditemukan" })

    await Retribution.findOne({ user: uid })
        .populate("user")
        .populate("stall")
        .populate({ path: "bills", options: { sort: { 'createdAt': -1 } } })
        .populate("invoices")
        .then((result) => {
            if (!result) return res.status(404).json({ message: "Retribution tidak ditemukan" })

            res.status(200).json(result)
        })
}

// CREATE a new retribution
export const createRetribution = async (req, res) => {
    const { stall_id, name, address, business_type } = req.body

    if (!name) return res.status(404).json({ message: "Harap mengisi nama" })
    if (!address) return res.status(404).json({ message: "Harap mengisi alamat" })
    if (!business_type) return res.status(404).json({ message: "Harap mengisi jenis dagang" })
    if (!stall_id) return res.status(404).json({ message: "Harus memilih tempat retribusi!" })
    if (!mongoose.Types.ObjectId.isValid(stall_id)) return res.status(404).json({ message: "kios atau los tidak ditemukan" })

    const stall = await Stall.findById({ _id: stall_id })
    if (!stall) return res.status(404).json({ message: "Kios atau los tidak ditemukan" })

    try {
        const retribution = await Retribution.createRetribution(stall_id, name, business_type, address)

        return res.status(200).json(retribution)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}

// DELETE a retribution
export const deleteRetribution = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: "Retribution tidak ditemukan" })

    // delete retribution dan user yang terhubung
    const retribution = await Retribution.findByIdAndDelete({ _id: id }).populate("user").then()

    await User.findOneAndDelete({ _id: retribution.user._id }).then((result) => {
        if (!result) return res.status(404).json({ message: "User tidak ditemukan" })
    }) // delete User

    return res.status(200).json(retribution)
}

// UPDATE a retribution
export const updateRetribution = async (req, res) => {
    const { id } = req.params
    const { stall_id, business_type, name, address } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: "Data tidak ditemukan" })
    if (!mongoose.Types.ObjectId.isValid(stall_id)) return res.status(404).json({ message: "Data tidak ditemukan" })

    try {
        const retribution = await Retribution.updateRetribution(id, stall_id, business_type, name, address)

        return res.status(200).json(retribution)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }

}