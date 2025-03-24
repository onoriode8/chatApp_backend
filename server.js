import express from 'express'
import mongoose from 'mongoose'
import cors from "cors"
import "dotenv/config.js"

import userRoutes from './routes/user.js'

const server = express();
 
server.use(express.json());

server.use(cors())  

server.use("/user", userRoutes)

//server.use("/admin", adminRoutes)


server.use((req, res) => {
    return res.status(404).json("Page not found")
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