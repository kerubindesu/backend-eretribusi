import Retribution from "../models/retributionModel.js"
import mongoose from "mongoose"


// GET all retributions
export const getRetributions = async (req, res) => {
    const retributions = await Retribution.find({}).sort({ createdAt: -1 })

    res.status(200).json(retributions)
}

// GET a single retribution
export const getRetribution = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No such retribution" })
    }

    const retribution = await Retribution.findById(id)

    if (!retribution) {
        return res.status(404).json({ error: "No such retribution" })
    }

    res.status(200).json(retribution)
}


// CREATE a new retribution
export const createRetribution = async (req, res) => {
    const { name, address } = req.body

    // add doc to mongodb
    try {
        const retribution = await Retribution.create({ name, address })
        res.status(200).json(retribution)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// DELETE a retribution
export const deleteRetribution = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No such retribution" })
    }

    const retribution = await Retribution.findOneAndDelete({ _id: id })

    if (!retribution) {
        return res.status(400).json({ error: "No such retribution" })
    }

    res.status(200).json(retribution)
}

// UPDATE a retribution
export const updateRetribution = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No such retribution" })
    }

    const retribution = await Retribution.findOneAndUpdate({ _id: id }, { ...req.body })

    if (!retribution) {
        return res.status(400).json({ error: "No such retribution" })
    }

    res.status(200).json(retribution)
}