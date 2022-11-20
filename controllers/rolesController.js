import mongoose from "mongoose"
import Role from "../models/roleModel.js"

// GET all roles
export const getRoles = async (req, res) => {
    const { q } = req.query
    const limit = parseInt(req.query.limit) || 10

    let totalItems

    await Role.find().countDocuments().then(async (count) => {
        totalItems = count
        await Role.find({ $or: [{ "name": { $regex: q, $options: "i" } }] })
            .sort({ name: 1 })
            .limit(limit)
            .then((result) => {
                if (!result) return res.status(404).json({ message: "Data tidak ditemukan" })

                return res.status(200).json({ data: result, totalItems })
            })
    })
}

// GET a single role
export const getRole = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: "role tidak ditemukan" })

    await Role.findById({ _id: id }).then((result) => {
        if (!result) return res.status(404).json({ message: "Role tidak ditemukan" })
        res.status(200).json(result)
    })
}

// CREATE a new role
export const createRole = async (req, res) => {
    const name = req.body.name

    const validName = name[0].toUpperCase() + name.slice(1).toLowerCase()
    const duplikat = await Role.findOne({ name: validName })

    if (duplikat) return res.status(400).json({ message: "Nama role sudah tersedia" })

    try {
        const role = await Role.create({ name: validName })

        return res.status(200).json(role)
    } catch (err) {
        return res.status(400).json(err.message)
    }
}

// Delete a role
export const deleteRole = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: "Role tidak ditemukan" })
    }

    try {
        const role = await Role.findOneAndDelete({ _id: id })

        return res.status(200).json(role)
    } catch (err) {
        return res.status(400).json(err.message)
    }
}

// UPDATE a role
export const updateRole = async (req, res) => {
    const { id } = req.params
    const name = req.body.name

    const validName = name[0].toUpperCase() + name.slice(1).toLowerCase()

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: "Data tidak ditemukan" })

    const check = await Role.findOne({ _id: id, name: validName })
    const exists = await Role.findOne({ name: validName })
    if (!check && exists) return res.status(400).json({ message: "Nama role sudah digunakan" })

    try {
        const role = await Role.findByIdAndUpdate({ _id: id }, { name: validName })

        return res.status(200).json(role)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}