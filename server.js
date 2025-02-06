const express = require('express');
const mongoose = require('mongoose');
require("dotenv").config();
const cors = require("cors")
const expressSession = require("express-session")


const userRoutes = require("./routes/user-routes");
const errorController = require("./controllers/userController/userErrors/error");

 

const server = express();
 
server.use(express.json());
server.use(expressSession({
    saveUninitialized: false,
    resave: false,
    secret: process.env.SESSION_SECRET,
    cookie: { secure: true } //change secure to true after testing the false value.
}))

server.set("trust proxy", true);


server.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, PATCH, GET, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    next();
}); 

server.use(cors())


server.use(userRoutes); 


server.use(errorController); 



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