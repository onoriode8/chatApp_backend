import express from 'express'
import mongoose from 'mongoose'
import cors from "cors"
import "dotenv/config.js"
import fs from 'fs'
import path from 'path'


import { init, socketId } from './socket.io.js'
import userRoutes from './routes/user.js'

const server = express();
 
server.use(express.json());

server.use(cors({
    origin: process.env.FRONTEND_PORT, 
    methods: ["GET, POST, PATCH, DELETE, PUT"]
}))


//serves image file dynamically.
server.use("/uploads/images",
     express.static(path.join("uploads", "images")))

server.use("/user", userRoutes)

//server.use("/admin", adminRoutes)


server.use((req, res) => {
    return res.status(404).json({})
})

//routes to catch server error.
server.use((error, req, res, next) => {
    if(req.file) {
        fs.unlink(req.file.path, (err) => {
            console.log('File deleted.');
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
            // console.log("Connected", socket.id)
            socketId(socket.id)
            socket.on("disconnect", () => {
                // console.log(`${socket.id} Disconnected`)
            })
        })
       
    })
    .catch(err => {
        if(process.env.NODE_ENV === "development") {
            console.log("error occur", err.message); 
        }
    })
