import jwt from 'jsonwebtoken'

const authorization = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        if(!token) throw new Error("Empty token provided")
        const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN)
        if(!decodedToken) throw new Error("Invalid details")
        req.userId = { id: decodedToken.id }
        next()
    } catch(err) {
        if(err.name === "TokenExpiredError"){
            return res.status(400).json("jwt expired")
        }
        return res.status(400).json(err.message)
    }
}

export default authorization;