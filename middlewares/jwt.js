const jwt = require("jsonwebtoken");
require("dotenv").config();


const JsonwebtokenMiddleWare = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        console.log("TOKEN line 8", token);
        if(!token || token === undefined) {
            throw new Error("token not found.");
        }
        const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);
        console.log("RESPONSE FROM DECODEDTOKEN line 13", decodedToken);
    } catch(err) {
        return res.status(400).json("");
    }
}

module.exports = JsonwebtokenMiddleWare; 