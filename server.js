import express from 'express'
import mongoose from 'mongoose'
import cors from "cors"
import "dotenv/config.js"
import fs from 'fs'
import path from 'path'

import userRoutes from './routes/user.js'

const server = express();
 
server.use(express.json());

server.use(cors())

//serves image file dynamically.
server.use("/uploads/images",
     express.static(path.join("uploads", "images")))

server.use("/user", userRoutes)

//server.use("/admin", adminRoutes)


server.use((req, res) => {
    return res.status(404).json("Page not found")
})

//routes to catch server error.
server.use((error, req, res, next) => {
    if(req.file) {
        fs.unlink(req.file.path, (err) => {
            console.log('File deleted.')
        })
    }
})

mongoose.connect(process.env.DB_URL)
    .then(res => {
        server.listen(process.env.PORT, () => {
            console.log(`app is serving on http://localhost:${process.env.PORT}`);
        })
    })
    .catch(err => {
        console.log("error occur", err.message); 
    })