import mongoose from "mongoose"
import BusinessType from "../models/businessTypeModel.js"

// GET all type of busineses
export const getBusinessTypes = async (req, res) => {
    const q = req.query.q
    const limit = parseInt(req.query.limit)

    let totalItems

    await BusinessType.find().countDocuments().then(async (count) => {
        totalItems = count

        await BusinessType.find({ $or: [{ "name": { $regex: q, $options: "i" } }] })
            .sort({ name: 1 })
            .limit(limit)
            .then((result) => {
                if (!result) return res.status(404).json({ message: "Data tidak ditemukan" })

                return res.status(200).json({ data: result, totalItems })
            })
    })
}

// GET a single type of business
export const getBusinessType = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: "Data tidak ditemukan" })

    await BusinessType.findById({ _id: id }).then((result) => {
        if (!result) return res.status(404).json({ message: "Data tidak ditemukan" })

        return res.status(200).json(result)
    })
}

// CREATE a new type of business
export const createBusinessType = async (req, res, next) => {
    const name = req.body.name

    if (!name) return res.status(400).json({ message: "Nama tidak boleh kosong!" })

    const validName = name[0].toUpperCase() + name.slice(1).toLowerCase()

    const check = await BusinessType.findOne({ name: validName })
    if (check) return res.status(400).json({ message: "Jenis usaha sudah tersedia!" })

    try {
        const businessType = await BusinessType.create({ name: validName })

        return res.status(200).json(businessType)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}

// Delete a type of business
export const deleteBusinessType = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: "Role tidak ditemukan" })

    try {
        const businessType = await BusinessType.findOneAndDelete({ _id: id })

        return res.status(200).json(businessType)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}

// UPDATE a type of business
export const updateBusinessType = async (req, res) => {
    const { id } = req.params
    const name = req.body.name

    const validName = name[0].toUpperCase() + name.slice(1).toLowerCase()

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: "Jenis usaha tidak ditemukan" })

    const check = await BusinessType.findOne({ _id: id, name: validName })
    const exists = await BusinessType.findOne({ name: validName })
    if (!check && exists) return res.status(400).json({ message: "Nama jenis usaha sudah digunakan" })

    try {
        const businessType = await BusinessType.findByIdAndUpdate({ _id: id }, { name: validName })

        return res.status(200).json(businessType)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
}