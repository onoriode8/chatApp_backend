import { rateLimit } from "express-rate-limit"

const expressRateLimit = rateLimit({
    windowMs: 60000 * 15,
    limit: 4,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        statusCode: 429,
        success: false,
        error: "Too many requests, please try again later after 15 minutes."
    },
    keyGenerator: (req, res, next, option) => req.body.email
})


export default expressRateLimit;