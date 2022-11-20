import mongoose from "mongoose"
import Stall from "../models/stallModel.js"
import Retribution from "../models/retributionModel.js"
import validator from "validator"

// GET all stalls
export const getStalls = async (req, res) => {
    const { q } = req.query
    const limit = parseInt(req.query.limit)

    const queryParseInt = parseInt(req.query.q)
    const intQuery = isNaN(queryParseInt) ? "" : queryParseInt
    let totalItems

    await Stall.find().countDocuments().then(async (count) => {
        totalItems = count
        await Stall.find({
            $or: [
                { "type": { $regex: q, $options: "i" }, },
                { "name": { $regex: q, $options: "i" } },
                { "size": intQuery },
                { "stall_cost": intQuery },
                { "waste_cost": intQuery },
            ]
        })
            .sort({ name: 1 })
            .limit(limit)
            .then((result) => {
                if (!result) return res.status(404).json({ message: "Data tidak ditemukan" })

                return res.status(200).json({ data: result, totalItems })
            })
    })
}

// GET all stalls
export const getFreeStalls = async (req, res) => {
    const { q } = req.query
    const retributions = await Retribution.find({}).select("stall")

    const stall = retributions.map((retribution) => retribution.stall)

    let filter
    if (q) {
        filter = {
            $or: [
                { "_id": q },
                { "_id": { $nin: stall } }
            ]
        }
    }

    if (!q) {
        filter = {
            "_id": { $nin: stall }
        }
    }

    await Stall.find(filter)
        .sort({ name: 1 })
        .then((result) => {
            if (!result) return res.status(404).json({ message: "Data tidak ditemukan" })

            return res.status(200).json({ data: result })
        })
}

// GET a single stall
export const getStall = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: "Satll tidak ditemukan" })

    await Stall.findById({ _id: id }).then((result) => {
        if (!result) return res.status(404).json({ message: "Stall tidak ditemukan" })
        return res.status(200).json(result)
    })
}

// CREATE a new stall
export const createStall = async (req, res) => {
    const {
        type,
        name,
        size
    } = req.body

    // Validation
    const validType = type.toLowerCase()
    const validName = name.toUpperCase()

    const duplikat = await Stall.findOne({ name: validName })
    if (duplikat) return res.status(400).json({ message: "Nama los atau kios sudah digunakan!" })

    if (!validator.isNumeric(size)) return res.status(400).json({ message: "Luas harus berupa angka!" })
    // End validation

    let stall_cost
    let waste_cost

    switch (type) {
        case "los":
            stall_cost = (size * 200)
            waste_cost = 200
            break;
        case "kios":
            stall_cost = 7200
            waste_cost = 8000
            break;
        default:
            return res.status(400).json({ message: "Maaf, tipe retribusi tidak tersedia" })
    }

    try {
        const stall = await Stall.create({
            type: validType,
            name: validName,
            size,
            stall_cost,
            waste_cost,
        })

        return res.status(200).json(stall)
    } catch (err) {
        return res.status(400).json(err.message)
    }
}

// Delete a stall
export const deleteStall = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: "Stall tidak ditemukan" })

    try {
        const stall = await Stall.findOneAndDelete({ _id: id })
        if (!stall) return res.status(404).json({ message: "Stall tidak ditemukan" })

        return res.status(200).json(stall)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}

// UPDATE a stall
export const updateStall = async (req, res) => {
    const { id } = req.params
    const { type, name, size } = req.body

    const validType = type.toLowerCase()
    const validName = name.toUpperCase()
    const validSize = parseInt(size)

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: "Data tidak ditemukan" })

    const stall = await Stall.findOne({ _id: id, name: validName })
    const exists = await Stall.findOne({ name: validName })
    if (!stall && exists) return res.status(400).json({ message: "Nama los atau kios sudah digunakan!" })

    if (!validator.isNumeric(String(size))) return res.status(400).json({ message: "Luas harus berupa angka!" })

    let stallCost
    let wasteCost

    switch (validType) {
        case "los":
            stallCost = (validSize * 200)
            wasteCost = 200
            break;
        case "kios":
            stallCost = 7200
            wasteCost = 8000
            break;
        default:
            return res.status(400).json({ message: "Maaf, tipe retribusi tidak tersedia" })
    }

    try {
        const stall = await Stall.findOneAndUpdate({ _id: id }, {
            type: validType,
            name: validName,
            size: validSize,
            stall_cost: stallCost,
            waste_cost: wasteCost
        })

        return res.status(200).json(stall)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}