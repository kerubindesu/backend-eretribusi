import mongoose from "mongoose";

const Schema = mongoose.Schema

const invoiceSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        require: true,
    },
    response_midtrans: {
        type: Object,
    }
}, { timestamps: true })

export default mongoose.model("Invoice", invoiceSchema);