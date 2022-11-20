import Invoice from "../models/invoiceModel.js"
import mongoose from "mongoose"

import midtransClient from "midtrans-client"

// Create Core API instance
let coreApi = new midtransClient.CoreApi({
    isProduction: false,
    serverKey: 'SB-Mid-server-yUbBJqhglyXT5pyU5OV58RI0',
    clientKey: 'SB-Mid-client-zOTo1GeBb0TmvZLh'
});

export const getInvoices = async (req, res) => {
    const invoices = await Invoice.find({}).sort({ createdAt: -1 })

    res.status(200).json(invoices)
}

// GET notification
export const invoiceNotification = (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No such retribution" })
    }

    coreApi.transaction.notification(req.body)
        .then(async (statusResponse) => {
            let orderId = statusResponse.order_id;
            let transactionStatus = statusResponse.transaction_status;

            const responseMidtrans = transactionStatus

            console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);

            const invoice = await Invoice.findOneAndUpdate({ _id: id }, { response_midtrans: responseMidtrans }).then(() => {
                res.status(200).json(invoice)
            }).catch((err) => {
                console.log(err.message)
            })

            // Sample transactionStatus handling logic

            // if (transactionStatus == 'capture') {
            //     // capture only applies to card transaction, which you need to check for the fraudStatus
            //     if (fraudStatus == 'challenge') {
            //         // TODO set transaction status on your databaase to 'challenge'
            //     } else if (fraudStatus == 'accept') {
            //         // TODO set transaction status on your databaase to 'success'
            //     }
            // } else if (transactionStatus == 'settlement') {
            //     // TODO set transaction status on your databaase to 'success'
            // } else if (transactionStatus == 'deny') {
            //     // TODO you can ignore 'deny', because most of the time it allows payment retries
            //     // and later can become success
            // } else if (transactionStatus == 'cancel' ||
            //     transactionStatus == 'expire') {
            //     // TODO set transaction status on your databaase to 'failure'
            // } else if (transactionStatus == 'pending') {
            //     // TODO set transaction status on your databaase to 'pending' / waiting payment
            // }
        });
}

// CREATE a new invoice
export const createInvoice = (req, res) => {
    const { name, address } = req.body

    coreApi.charge(req.body)
        .then(async (chargeResponse) => {

            const response_midtrans = chargeResponse;
            const invoice = await Invoice.create({ name, address, response_midtrans })
            res.status(200).json(invoice)
        })
        .catch((err) => {
            console.log('Error occured:', err.message);
        });
}