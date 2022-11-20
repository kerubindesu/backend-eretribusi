import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator"

const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    }
})

// static register method
userSchema.statics.register = async function (name, email, role, password) {

    // validation
    if (!email || !password) {
        throw Error("Kolom tidak boleh kosong!")
    }

    if (!validator.isEmail(email)) {
        throw Error("Email tidak valid!")
    }

    if (!validator.isStrongPassword(password)) {
        throw Error("Password harus menggunakan kombinasi huruf kecil, huruf besar, angka dan karakter")
    }

    const exists = await this.findOne({ email })

    if (exists) {
        throw Error("Email sudah digunakan!")
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = await this.create({ name, email, role, password: hash })

    return user
}

// static login method
userSchema.statics.login = async function (email, password) {
    if (!email || !password) {
        throw Error("Kolom tidak boleh kosong!")
    }

    const user = await this.findOne({ email })

    if (!user) {
        throw Error("Email tidak ditemukan!")
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
        throw Error("Password tidak sesuai")
    }

    return user
}

export default mongoose.model("User", userSchema)