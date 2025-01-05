const jwt = require("jsonwebtoken");
require("dotenv").config();


const JsonwebtokenMiddleWare = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        if(!token || token === undefined) {
            throw new Error("token not found.");
        }
        const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);
        req.userData = {
            userId: decodedToken.userId,
            username: decodedToken.username,
            email: decodedToken.email
        }
        next();
    } catch(err) {
        if(err.name === "TokenExpiredError") {
            return res.status(401).json({message : "Your session has expired",
                caution: "Login again to continue using the app."});
        }

        return res.status(400).json("You can't access this route.");
    }
}

module.exports = JsonwebtokenMiddleWare; 