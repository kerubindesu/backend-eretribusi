import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { config } from "dotenv"
import mongoose from "mongoose"
import corsOptions from "./config/corsOption.js"
import retributonRoutes from "./routes/retributions.js"
import invoiceRoutes from "./routes/invoices.js"
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import billRoutes from "./routes/bills.js"
import stallRoutes from "./routes/stalls.js"
import BusinessTypeRoutes from "./routes/businessTypes.js"
import RoleRoutes from "./routes/roles.js"

const PORT = process.env.PORT || config().parsed.PORT
const MONGO_URI = config().parsed.MONGO_URI
const HEADER_STYLE = config().parsed.HEADER_STYLE

const app = express() // express app

// @Middleware
// app.use(cors(corsOptions))
app.use(cors(corsOptions))

app.use(cookieParser())
app.use(express.json())

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

// @Routes
app.get("/", (req, res) => res.send(HEADER_STYLE)) // index route
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/invoices", invoiceRoutes)
app.use("/api/retributions", retributonRoutes)
app.use("/api/bills", billRoutes)
app.use("/api/stalls", stallRoutes)
app.use("/api/type-of-business", BusinessTypeRoutes)
app.use("/api/roles", RoleRoutes)

app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('json')) {
        res.json({ message: '404 Not Found' })
    } else {
        res.type('txt').send('404 Not Found')
    }
})

// connect to mongodb
try {
    await mongoose.connect(MONGO_URI)
    console.log('successfully connected to mongoose')
    // listen to port
    app.listen(PORT, () => {
        console.log('listening for requests on port', PORT)
    })
} catch (err) {
    console.log(err)
}