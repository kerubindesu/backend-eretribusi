import allowedOrigins from "./allowedOrigins.js"

const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    optionsSuccessStatus: 200
}

export default corsOptions 