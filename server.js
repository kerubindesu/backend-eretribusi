import express from "express"
import cors from "cors"
import { config } from "dotenv"
import mongoose from "mongoose"
import retributonRoutes from "./routes/retributions.js"
import invoiceRoutes from "./routes/invoices.js"
import userRoutes from "./routes/user.js"

const PORT = config().parsed.PORT || 4000
const MONGO_URI = "mongodb + srv://kerubindesu:tWgtTy4ZbM074S8o@cluster0.vltgt6s.mongodb.net/eretribution?retryWrites=true&w=majority"

// express app
const app = express()

app.use(cors())

// middleware
app.use(express.json())

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

// routes
app.use("/api/retributions", retributonRoutes)
app.use("/api/invoices", invoiceRoutes)
app.use("/api/user", userRoutes)

// connect to mongodb
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('connected to database')
        // listen to port
        app.listen(PORT, () => {
            console.log('listening for requests on port', PORT)
        })
    })
    .catch((err) => {
        console.log(err)
    })