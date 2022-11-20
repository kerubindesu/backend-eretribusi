import express from "express"
import { invoiceNotification, createInvoice, getInvoices } from "../controllers/invoiceController.js"
import requireAuth from "../middleware/requireauth.js"

const router = express.Router()

// require auth for all invoice auth
// router.use(requireAuth)

// GET all invoices
router.get("/", getInvoices)

// GET notification
router.get("/notification", invoiceNotification)

// POST a new invoice
router.post("/charge", createInvoice)

export default router