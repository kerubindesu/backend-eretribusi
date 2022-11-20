import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator"

const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    business_type: {
        type: String,
    },
    address: {
        type: String,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    }
})

// static register method
userSchema.statics.register = async function (name, business_type, address, username, role, password) {

    // validation
    if (!username) throw Error("Harap mengisi username")
    if (!password) throw Error("Harap mengisi password")

    if (!validator.isStrongPassword(password)) throw Error("Password minimal 8 karakter setidaknya mengandung huruf kecil a-z, huruf kapital A-Z, angka 0-9 dan karakter khusus !@#$%^&*")

    const exists = await this.findOne({ username })
    if (exists) throw Error("Username sudah digunakan!")

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    const user = await this.create({ name, business_type, address, username, role, password: hash })

    return user
}

// static login method
userSchema.statics.userEdit = async function (id, name, business_type, address) {
    const user = await this.findByIdAndUpdate({ _id: id }, { name, business_type, address })

    return user
}

export default mongoose.model("User", userSchema)