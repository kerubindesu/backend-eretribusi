import express from "express"
import { getInvoices, getUserInvoices, getInvoice, invoiceNotification, chargeInvoice, income } from "../controllers/invoicesController.js"
import verifyJWT from "../middleware/verifyJWT.js"

const router = express.Router()

// router.get("/", verifyJWT, getInvoices) // GET all invoices

router.get("/", getInvoices) // GET all invoices

router.get("/income", income) // GET a new invoice

router.post("/notification", invoiceNotification) // POST notification

router.get("/user", verifyJWT, getUserInvoices) // GET a single invoice

router.get("/:id", getInvoice) // GET a single invoice

router.post("/charge", chargeInvoice) // POST a new invoice

export default router