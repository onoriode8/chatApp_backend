import express from 'express'
import { body } from 'express-validator'

import { signup } from '../controllers/user.js'

const router = express.Router()


router.post("/signup", 
    body("email").trim().isEmail().normalizeEmail(),
    body("password").trim().isLength({ min: 6 }), signup)


export default router;