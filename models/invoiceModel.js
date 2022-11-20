import mongoose from "mongoose"
import Retribution from "./retributionModel.js"
import Bill from "./billModel.js"
import coreApi from "../config/midtransCoreApi.js"

const Schema = mongoose.Schema

const invoiceSchema = new Schema({
    order_id: {
        type: String,
        unique: true,
    },
    payment_type: {
        type: String,
        required: true,
    },
    transaction_status: {
        type: String,
        required: true,
    },
    action: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    stall_type: {
        type: String,
        required: true,
    },
    stall_name: {
        type: String,
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
    total_price: {
        type: Number,
        required: true,
    },
    transaction_time: {
        type: String,
    },
    bill: { type: Schema.Types.ObjectId, ref: Bill },
}, { timestamps: true })

invoiceSchema.statics.charge = async function (retribution, bill, stall_cost, waste_cost, total_price, payment_type, orderId) {

    let paymentCategory

    switch (payment_type) {
        case 'gopay':
        case 'shopeepay':
            paymentCategory = "e_money"
            break;
        case 'bca':
        case 'bni':
        case 'bri':
        case 'permata':
            paymentCategory = "virtual_account"
            break;
        default:
            throw Error(`maaf, tipe pembayaran ${payment_type} belum tersedia.`)
    }

    const paramater = (body) => {
        // charge using VA/ATM
        if (paymentCategory == "virtual_account") {
            return body = {
                "payment_type": "bank_transfer",
                "bank_transfer": {
                    "bank": payment_type
                },
                "transaction_details": {
                    "order_id": orderId,
                    "gross_amount": total_price,
                },
            }
        }
        // charge using E-Wallet
        else if (paymentCategory == "e_money") {
            if (payment_type == "gopay") {
                return body = {
                    "payment_type": payment_type,
                    "transaction_details": {
                        "order_id": orderId,
                        "gross_amount": total_price,
                    },
                    "item_details": [{
                        "id": orderId,
                        "price": total_price,
                        "quantity": 1,
                        "name": bill.stall_type
                    }],
                    "customer_details": {
                        "name": retribution.user.name,
                        "address": retribution.user.address
                    },
                    "gopay": {
                        "enable_callback": true,
                        "callback_url": "http://localhost:3000"
                    }
                }
            } else if (payment_type == "shopeepay") {
                return body = {
                    "payment_type": "shopeepay",
                    "transaction_details": {
                        "order_id": orderId,
                        "gross_amount": total_price,
                    },
                    "item_details": [{
                        "id": orderId,
                        "price": total_price,
                        "quantity": 1,
                        "name": bill.stall_type
                    }],
                    "customer_details": {
                        "name": retribution.user.name,
                        "address": retribution.user.address
                    },
                    "shopeepay": {
                        "callback_url": "http://localhost:3000"
                    }
                }
            }
        }
    }

    const chargeResponse = await coreApi.charge(paramater()) // charge a invoice

    const transactionStatus = chargeResponse.transaction_status;
    const grossAmount = chargeResponse.gross_amount;
    let action
    switch (payment_type) {
        case 'bca':
        case 'bni':
        case 'bri':
            action = chargeResponse.va_numbers[0].va_number
            break;
        case 'permata':
            action = chargeResponse.permata_va_number
            break;
        case 'gopay':
            action = chargeResponse.actions[1].url;
            break;
        case 'shopeepay':
            action = chargeResponse.actions[0].url;
            break;
        default:
            throw Error(`${payment_type} tidak tersedia`)
    }

    // create a invoice
    try {
        const invoice = await this.create({
            order_id: orderId,
            payment_type: payment_type,
            transaction_status: transactionStatus,
            action: action,
            name: retribution.user.name,
            stall_type: retribution.stall.type,
            stall_name: retribution.stall.name,
            stall_cost,
            waste_cost,
            total_price: grossAmount,
            bill: bill._id
        })

        // push objectId invoice ke retribution
        try {
            const updateRetribution = await Retribution.findByIdAndUpdate({ "_id": retribution._id }, {
                $push: {
                    "invoices": invoice._id
                }
            })
            updateRetribution
        } catch (err) {
            throw Error(err)
        }
        return invoice
    } catch (err) {
        throw Error(err)
    }
}

export default mongoose.model("Invoice", invoiceSchema);