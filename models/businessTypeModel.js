import mongoose from "mongoose";


const Schema = mongoose.Schema

const BusinessTypeSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
}, { timestamps: true })

export default mongoose.model("BusinessType", BusinessTypeSchema);