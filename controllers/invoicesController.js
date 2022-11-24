import mongoose from "mongoose"
import Invoice from "../models/invoiceModel.js"
import Retribution from "../models/retributionModel.js"
import Bill from "../models/billModel.js"
import User from "../models/userModel.js"
import coreApi from "../config/midtransCoreApi.js"
import validator from "validator"

export const getInvoices = async (req, res) => {
    const { q } = req.query
    const limit = parseInt(req.query.limit)

    const queryParseInt = parseInt(req.query.q)
    const intQuery = isNaN(queryParseInt) ? "" : queryParseInt

    let totalItems

    await Invoice.find().countDocuments().then(async (count) => {
        totalItems = count

        await Invoice.find({
            $or: [
                { "name": { $regex: q, $options: "i" }, },
                { "payment_type": { $regex: q, $options: "i" } },
                { "order_id": { $regex: q, $options: "i" } },
                { "stall_name": { $regex: q, $options: "i" } },
                { "transaction_status": { $regex: q, $options: "i" } },
                { "transaction_time": { $regex: q, $options: "i" } },
                { "total_price": intQuery },
            ]
        })
            .populate("bill")
            .sort({ updatedAt: -1 })
            .limit(limit)
            .then((result) => {
                if (!result) return res.status(404).json({ message: "Data tidak ditemukan" })

                return res.status(200).json({ data: result, totalItems })
            })
    })
}

// GET user invoices
export const getUserInvoices = async (req, res) => {
    const { q } = req.query
    const limit = parseInt(req.query.limit)
    const username = req.username
    const user = await User.findOne({ username })
    const uid = user._id

    const queryParseInt = parseInt(req.query.q)
    const intQuery = isNaN(queryParseInt) ? "" : queryParseInt

    let totalItems

    const retribution = await Retribution.findOne({ user: uid }).select("invoices")
    if (!retribution) return res.status(400).json({ message: "Anda tidak memiliki retribusi" })

    await Invoice.find({ _id: retribution.invoices }).countDocuments().then(async (count) => {
        totalItems = count
        await Invoice.find({
            $and:
                [
                    { _id: retribution.invoices },
                    {
                        $or: [
                            { "name": { $regex: q, $options: "i" }, },
                            { "payment_type": { $regex: q, $options: "i" } },
                            { "order_id": { $regex: q, $options: "i" } },
                            { "stall_type": { $regex: q, $options: "i" } },
                            { "stall_name": { $regex: q, $options: "i" } },
                            { "transaction_status": { $regex: q, $options: "i" } },
                            { "transaction_time": { $regex: q, $options: "i" } },
                            { "total_price": intQuery },
                        ]
                    }
                ]
        })
            .populate("bill")
            .sort({ createdAt: -1 })
            .limit(limit)
            .then((result) => {
                if (!result) return res.status(404).json({ message: "Data tidak ditemukan" })

                return res.status(200).json({ data: result, totalItems })
            })
    })
}

// GET a single invoice
export const getInvoice = async (req, res) => {
    const id = req.params.id

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: "invoice tidak ditemukan" })

    await Invoice.findById({ _id: id })
        .populate("bill")
        .then((result) => {
            if (!result) return res.status(404).json({ message: "Data tidak ditemukan" })

            return res.status(200).json(result)
        })
}

// CREATE a new invoice
export const chargeInvoice = async (req, res) => {
    const { retribution_id, bill_id, stall_cost, waste_cost, total_price, payment_type } = req.body

    // Error Handling
    if (!mongoose.Types.ObjectId.isValid(retribution_id)) return res.status(404).json({ message: "retribution tidak ditemukan" })
    if (!mongoose.Types.ObjectId.isValid(bill_id)) return res.status(404).json({ message: "tagihan tidak ditemukan" })

    // define retribution
    const retribution = await Retribution.findOne({ _id: retribution_id }).populate("stall").populate("user", "-password").populate("bills").populate("invoices")

    // define tagihan
    const bill = await Bill.findById({ _id: bill_id })
    if (!bill) return res.status(404).json({ message: "Tagihan tidak ditemukan!" })

    // validasi tagihan
    if (retribution.stall.type !== bill.stall_type) return res.status(400).json({ message: "kesalahan, tagihan tidak sesuai dengan retribution" })

    if (!stall_cost) return res.status(400).json({ message: "Harap mengisi biaya tempat retribusi" })
    if (!waste_cost) return res.status(400).json({ message: "Harap mengisi biaya sampah" })
    if (!total_price) return res.status(400).json({ message: "Harap mengisi total pembayaran" })
    if (!payment_type) return res.status(400).json({ message: "Harap memilih tipe pembayaran" })

    if (!validator.isNumeric(String(stall_cost))) return res.status(400).json({ message: "Biaya tempat retribusi harus berupa angka" })
    if (!validator.isNumeric(String(waste_cost))) return res.status(400).json({ message: "Biaya sampah harus berupa angka" })
    if (!validator.isNumeric(String(total_price))) return res.status(400).json({ message: "Total pembayaran harus berupa angka" })

    // validasi invoice
    const orderId = `${retribution.stall.type.toUpperCase()}-${retribution.stall.name.toUpperCase()}-${bill.q_bill}` // Buat orderId
    const check = await Invoice.findOne({ order_id: orderId })
    let validate
    if (check) validate = await Retribution.findOne({ invoices: check._id })

    if (check && validate) return res.status(400).json({ message: "kesalahan, invoice dengan tagihan yang sama sudah pernah dibuat" })
    // End Error Handling

    try {
        const invoice = await Invoice.charge(
            retribution,
            bill,
            stall_cost,
            waste_cost,
            total_price,
            payment_type,
            orderId
        )

        return res.status(200).json(invoice)
    } catch (err) {
        console.log(err.message)
        return res.status(400).json({ message: err.message })
    }
}

// Handle notification
export const invoiceNotification = async (req, res) => {
    try {
        const statusResponse = await coreApi.transaction.notification(req.body)
        console.log(statusResponse)

        const orderId = statusResponse.order_id;
        const fraudStatus = statusResponse.fraud_status;

        const transactionStatus = statusResponse.transaction_status
        const transactionTime = statusResponse.transaction_time

        console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);

        const invoice = await Invoice.findOneAndUpdate({ order_id: orderId }, { transaction_status: transactionStatus, transaction_time: transactionTime })

        // update transaction_time dan hapus tagihan di retribution ketika status transaksi settlement
        if (transactionStatus === "settlement") {
            const invoice = await Invoice.findOneAndUpdate({ order_id: orderId }, { transaction_time: transactionTime })
            const retribution = await Retribution.findOneAndUpdate({ "invoices": invoice._id }, {
                $pull: {
                    "bills": invoice.bill
                }
            })
            console.log(`tagihan pada ${retribution._id} berhasil dihapus`)
        }

        return res.status(200).json(invoice)
    } catch (err) {
        console.log(err)

        return res.status(400).json({ message: err.message })
    }
}

export const income = async (req, res) => {
    const today = new Date()
    let endDate
    endDate = (req.query.endDate === "") ? today : new Date(req.query.endDate)

    let startDate
    const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth() - 5, endDate.getDate())
    startDate = (req.query.startDate === "") ? prevMonth : new Date(req.query.startDate)

    const kiosRetribution = await Invoice.aggregate([
        {
            $match: {
                transaction_status: "settlement",
                stall_type: "kios",
                updatedAt: { $gte: startDate, $lte: endDate },
            }
        },
        {
            $group: {
                _id: { year: { $year: "$updatedAt" }, month: { $month: "$updatedAt" }, },
                totalIncome: { $sum: "$stall_cost" },
            },
        },
        { $sort: { "_id.month": 1, "_id.year": 1 } }
    ])

    const losRetribution = await Invoice.aggregate([
        {
            $match: {
                transaction_status: "settlement",
                stall_type: "los",
                updatedAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: { year: { $year: "$updatedAt" }, month: { $month: "$updatedAt" }, },
                totalIncome: { $sum: "$stall_cost" },
            },
        },
        { $sort: { "_id.month": 1, "_id.year": 1 } }
    ])

    const wasteRetribution = await Invoice.aggregate([
        {
            $match: {
                transaction_status: "settlement",
                updatedAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: { year: { $year: "$updatedAt" }, month: { $month: "$updatedAt" }, },
                totalIncome: { $sum: "$waste_cost" },
            },
        },
        { $sort: { "_id.month": 1, "_id.year": 1 } }
    ])

    res.status(200).json({ kiosRetribution, losRetribution, wasteRetribution })
}