const express = require('express');
const mongoose = require('mongoose');
require("dotenv").config();
const cors = require("cors")
const { v4: uuidv4 } = require("uuid")


const userRoutes = require("./routes/user-routes");
const errorController = require("./controllers/userController/userErrors/error");
// const adminRoutes = require("./routes/admin-routes");

 

const server = express();
 
server.use(express.json());


server.set("trust proxy", true);


server.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, PATCH, GET, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    next();
}); 

server.use(cors())

// server.use("/", () => {
//     return res.status(200).json({ message: "Navigate to the rightful routes"});
// })

// server.get("/", (req, res) => {
//     console.log("testing ip address");
//     res.send(req.headers['x-forwarded-for'] || req.connection.remoteAddress);
// })

server.use(userRoutes); 

//server.use("/admin", adminRoutes) // work on the connection later with the routes and controller and admin model

server.use(errorController); 

// server.listen(PORT, () => {
//     console.log(`app is serving on http://localhost:${PORT}`);
// })



// console.log("generated uuid", uuidv4())
// console.log("removed alphabetic character", uuidv4().replace(/\D/g, ""));
// console.log("slice to 10 digit number", uuidv4().replace(/\D/g, "").slice(0, 10));
// console.log(process.env.DB_NAME, process.env.DB_PASSWORD, process.env.DB_COLLECTION)


const DB_URL = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.e3pic.mongodb.net/${process.env.DB_COLLECTION}?retryWrites=true&w=majority&appName=Cluster0`

mongoose.connect(DB_URL)
    .then(res => {
        server.listen(process.env.PORT, () => {
            console.log(`app is serving on http://localhost:${process.env.PORT}`);
        })
    })
    .catch(err => {
        console.log("error occur", err.message); 
    })