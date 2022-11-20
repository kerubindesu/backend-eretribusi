import mongoose from "mongoose";
import User from "./userModel.js"
import Bill from "./billModel.js"
import Stall from "./stallModel.js"
import Invoice from "./invoiceModel.js"

const Schema = mongoose.Schema

const retributionSchema = new Schema({
    stall: { type: Schema.Types.ObjectId, ref: Stall },
    user: { type: Schema.Types.ObjectId, ref: User },
    bills: [{ type: Schema.Types.ObjectId, ref: Bill }],
    invoices: [{ type: Schema.Types.ObjectId, ref: Invoice }]
}, { timestamps: true })

retributionSchema.statics.createRetribution = async function (stall_id, name, business_type, address) {

    // cek duplikat stall
    const exists = await this.findOne({ "stall": stall_id })
    if (exists) {
        throw Error("Kios atau Los sudah digunakan! Harap memilih lainnya.")
    }

    const stall = await Stall.findById({ _id: stall_id })

    // define user atribute value
    const username = `${stall.type.toLowerCase()}${stall.name}`
    const role = "Pedagang"
    const password = "passWord2022!"

    try {
        const user = await User.register(
            name,
            business_type,
            address,
            username,
            role,
            password
        )
        console.log(user)
        try {
            // insert objectId user ke retribution
            const retribution = await this.create({
                stall: stall_id,
                user: user._id,
                bills: [],
                invoices: []
            })
            return { user, retribution }
        } catch (err) {
            throw Error(err)
        }
    } catch (err) {
        throw Error(err)
    }
}

retributionSchema.statics.updateRetribution = async function (id, stall_id, business_type, name, address) {
    if (!business_type || !name || !address) {
        throw Error("Kolom tidak boleh kosong!")
    }

    // cek duplikat stall
    const found = await this.findOne({ "_id": id, "stall": stall_id })
    const exists = await this.findOne({ "stall": stall_id })
    if (!found && exists) {
        throw Error("Duplikat! kios atau los sudah digunakan")
    }

    try {
        const retribution = await this.findOneAndUpdate({ _id: id }, {
            stall: { _id: stall_id }
        })

        await User.userEdit(
            id = retribution.user._id,
            name,
            business_type,
            address
        )

        return retribution
    } catch (err) {
        throw Error({ error: err })
    }
}

export default mongoose.model("Retribution", retributionSchema);