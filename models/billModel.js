import mongoose from "mongoose";
import Retribution from "./retributionModel.js"
import Stall from "./stallModel.js"

const Schema = mongoose.Schema

const billSchema = new Schema({
    stall_type: {
        type: String,
        required: true,
    },
    q_bill: {
        type: String,
        require: true,
        unique: true,
    },
    due_date: {
        type: Date,
        require: true,
    },
}, { timestamps: true })

billSchema.statics.createBill = async function (stall_type, new_date) {
    const today = new Date(new_date)
    const year = today.getFullYear()
    const month = today.getMonth()
    const date = today.getDate()
    const lastDayOfMonth = new Date(year, month + 1, 1);

    let dueDate
    switch (stall_type) {
        case "kios":
            dueDate = lastDayOfMonth.toISOString().substring(0, 10)
            break;
        case "los":
            dueDate = today.toISOString().substring(0, 10)
            break;
        default:
            throw Error(`${stall_type} tidak ditemukan`)
    }

    let q_bill
    switch (stall_type) {
        case "kios":
            q_bill = `${year}${month + 1}`
            break;
        case "los":
            q_bill = `${year}${month + 1}${date}`
            break;
        default:
            throw Error(`${stall_type} tidak ditemukan`)
    }

    const exists = await this.findOne({ q_bill: q_bill })
    if (exists) throw Error("Duplikat! tagihan dengan tanggal yang sama sudah pernah dibuat")

    try {
        const bill = await this.create({ stall_type, q_bill: q_bill, due_date: dueDate })

        try {
            // define stalls _id where type = stall_type
            const stall = await Stall.find({ type: stall_type }).select("_id") // expect: [{id: ObjectId(####)}, {id: ObjectId(####)}, ...]

            const retribution = await Retribution.updateMany({ "stall": stall }, {
                $push: {
                    "bills": bill._id
                }
            }) // push objectId tagihan ke retribution

            return { bill, stall, retribution }
        } catch (err) {
            throw Error({ err })
        }
    } catch (err) {
        throw Error({ err })
    }
}

billSchema.statics.updateBill = async function (id, stall_type, new_date) {
    const today = new Date(new_date)
    const year = today.getFullYear();
    const month = today.getMonth();
    const date = today.getDate();

    const lastDayOfMonth = new Date(year, month + 1, 1);

    let dueDate
    switch (stall_type) {
        case "kios":
            dueDate = lastDayOfMonth.toISOString().substring(0, 10)
            break;
        case "los":
            dueDate = today.toISOString().substring(0, 10)
            break;
        default:
            throw Error(`${stall_type} tidak ditemukan`)
    }

    let q_bill
    switch (stall_type) {
        case "kios":
            q_bill = `${year}${month + 1}`
            break;
        case "los":
            q_bill = `${year}${month + 1}${date}`
            break;
        default:
            throw Error(`${stall_type} tidak ditemukan`)
    }

    const check = await this.findOne({ q_bill: q_bill })
    const exists = await this.findOne({ _id: id, q_bill: q_bill })
    if (check && !exists) throw Error("Tagihan sudah pernah dibuat!")

    try {
        const bill = await this.findOneAndUpdate({ _id: id }, { stall_type, q_bill: q_bill, due_date: dueDate })

        return bill
    } catch (err) {
        throw Error(err)
    }
}

export default mongoose.model("Bill", billSchema);