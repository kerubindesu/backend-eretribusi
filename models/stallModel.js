import mongoose from "mongoose";

const Schema = mongoose.Schema

const stallSchema = new Schema({
    type: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
    },
    size: {
        type: Number,
        required: true,
    },
    stall_cost: {
        type: Number,
        required: true,
    },
    waste_cost: {
        type: Number,
        required: true,
    },
}, { timestamps: true })

export default mongoose.model("Stall", stallSchema);