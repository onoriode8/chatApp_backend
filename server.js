import express from 'express'
import mongoose from 'mongoose'
import cors from "cors"
import "dotenv/config.js"
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'

import { init, socketId } from './socket.io.js'
import userRoutes from './routes/user.js'

const server = express();
 
server.use(helmet()) 
server.use(compression())
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, "access.log"),
    { flats: "a" }
)

server.use(morgan("combined", { stream: accessLogStream }))
server.use(express.json());


server.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET, POST, PATCH, DELETE, PUT"],
    credentials: true
}))

server.use("/uploads/images", express.static(path.join(__dirname, "uploads/images")))

server.use("/user", userRoutes)

server.use((req, res) => {
    return res.status(404).json({})
})


server.use((error, req, res, next) => {
    if(req.file) {
        fs.unlink(req.file.path, (err) => {
            return res.status(400).json("")
        })
    }
})

mongoose.connect(process.env.DB_URL)
    .then(res => {
        const httpServer = server.listen(process.env.PORT, () => {
            {process.env.NODE_ENV === "development" ? 
                console.log(
                    `app is serving on http://localhost:${process.env.PORT}`
                ) : console.log("RUNNING")
            }
        })
        
        const io = init(httpServer)
       
        io.on("connection", socket => {
            socketId(socket.id)
            socket.on("disconnect", () => {
            })
        })
       
    })
    .catch(err => {
        if(process.env.NODE_ENV === "development") {
        }
    })