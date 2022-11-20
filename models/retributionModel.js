import mongoose from "mongoose";

const Schema = mongoose.Schema

const retributionSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        require: true,
    }
}, { timestamps: true })

export default mongoose.model("Retribution", retributionSchema);