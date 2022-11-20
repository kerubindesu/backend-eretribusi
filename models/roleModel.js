import mongoose from "mongoose";

const Schema = mongoose.Schema

const roleSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
})

export default mongoose.model("Role", roleSchema)