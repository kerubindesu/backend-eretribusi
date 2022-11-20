import mongoose from "mongoose"
import Bill from "../models/billModel.js"
import Retribution from "../models/retributionModel.js"
import Stall from "../models/stallModel.js"
import User from "../models/userModel.js"

// GET all bills
export const getBills = async (req, res) => {
    const { q } = req.query
    const limit = parseInt(req.query.limit)

    const queryParseInt = parseInt(req.query.q)
    const intQuery = isNaN(queryParseInt) ? "" : queryParseInt

    let totalItems

    await Bill.find().countDocuments().then(async (count) => {
        totalItems = count
        await Bill.find({
            $or: [
                { "stall_type": { $regex: q, $options: "i" } },
                { "q_bill": { $regex: q, $options: "i" } },
                { "due_date": { $in: intQuery } },
            ]
        })
            .sort({ updatedAt: -1 })
            .limit(limit)
            .then((result) => {
                if (!result) return res.status(404).json("Data tidak ditemukan")
                return res.status(200).json({ data: result, totalItems })
            })
    })
}

// GET bills & retribution using user id
export const getUserBills = async (req, res) => {
    const username = req.username
    const user = await User.findOne({ username })
    const uid = user._id

    const { q } = req.query
    const limit = parseInt(req.query.limit)
    const queryParseInt = parseInt(req.query.q)
    const intQuery = isNaN(queryParseInt) ? "" : queryParseInt

    let totalItems

    if (!mongoose.Types.ObjectId.isValid(uid)) return res.status(404).json("Tagihan tidak ditemukan")

    const retribution = await Retribution.findOne({ user: uid }).select("bills")

    await Bill.find({ _id: retribution.bills }).countDocuments().then(async (count) => {
        totalItems = count
        await Bill.find({
            $and: [
                { _id: retribution.bills },
                {
                    $or: [
                        { "stall_type": { $regex: q, $options: "i" } },
                        { "q_bill": { $regex: q, $options: "i" } },
                        { "due_date": { $in: intQuery } },
                    ]
                }]
        })
            .sort({ "due_date": -1 })
            .limit(limit)
            .then((bills) => {
                return res.status(200).json({ data: bills, totalItems })
            })
    })
}

// GET bill & retributions
export const getInfoBill = async (req, res) => {
    const { id } = req.params
    const { q } = req.query
    const limit = parseInt(req.query.limit)

    const queryParseInt = parseInt(req.query.q)
    const intQuery = isNaN(queryParseInt) ? "" : queryParseInt

    let totalItems

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: "Tagihan tidak ditemukan" })

    const stall = await Stall.find({
        $or: [
            { "type": { $regex: q, $options: "i" }, },
            { "name": { $regex: q, $options: "i" } },
            { "size": intQuery },
        ]
    }).select("_id")

    const user = await User.find({
        $or: [
            { "name": { $regex: q, $options: "i" } },
            { "address": { $regex: q, $options: "i" }, },
            { "business_type": { $regex: q, $options: "i" }, },
        ]
    }).select("_id")

    await Bill.findOne({ _id: id }).then(async (bill) => {
        if (!bill) return res.status(404).json({ message: "Tagihan tidak ditemukan" })

        await Retribution.find({ bills: id }).countDocuments().then(async (count) => {
            totalItems = count

            await Retribution.find({
                $and: [{ bills: id }, { $or: [{ stall: stall }, { user: user }] }]
            })
                .populate({ path: "user", options: { sort: { 'name': 1 } } })
                .populate("stall")
                .populate("bills")
                .limit(limit)
                .then((retributions) => {
                    return res.status(200).json({ bill, retributions, totalItems })
                })
        })

    })
}

// GET a single bill
export const getBill = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: "Tagihan tidak ditemukan" })

    await Bill.findOne({ _id: id }).then((result) => {
        if (!result) return res.status(404).json({ message: "Tagihan tidak ditemukan" })

        return res.status(200).json(result)
    })
}

// CREATE a new bill
export const createBill = async (req, res, next) => {
    const { stall_type, new_date } = req.body

    if (!stall_type) return res.status(400).json({ message: "Harap memilih tipe retribusi" })
    if (!new_date) return res.status(400).json({ message: "Harap mengisi tanggal" })

    try {
        const bill = await Bill.createBill(stall_type, new_date)

        return res.status(200).json(bill)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

// Delete a bill
export const deleteBill = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: "Tagihan tidak ditemukan" })

    try {
        const bill = await Bill.findOneAndDelete({ _id: id })

        if (!bill) return res.status(404).json({ message: "Tagihan tidak ditemukan" })

        try {
            // delete objectId tagihan di retribution
            const retribution = await Retribution.updateMany({ "bills": id }, {
                $pull: {
                    "bills": id
                }
            })
            return res.status(200).json({ bill, retribution })
        } catch (err) {
            return res.status(400).json({ message: err.message })
        }
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}

// UPDATE a bill
export const updateBill = async (req, res) => {
    const { id } = req.params
    const { stall_type, new_date } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: "Tagihan tidak ditemukan" })

    if (!stall_type) return res.status(400).json({ message: "Harap memilih tipe retribusi" })
    if (!new_date) return res.status(400).json({ message: "Harap mengisi tanggal" })

    try {
        const bill = await Bill.updateBill(id, stall_type, new_date)

        return res.status(200).json(bill)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}